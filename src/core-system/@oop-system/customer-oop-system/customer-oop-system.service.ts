import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { ERROR, iPageDTO } from 'src/@core'
import { TYPE_RANK_CUSTOMER, TYPE_REFERRAL_CODE } from 'src/@repositories/module/mongodb/@database/enum/base.enum'
import { CustomerRepositoryService } from 'src/@repositories/repository-service/customer-repository/customer-repository.service'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'



@Injectable()
export class CustomerOopSystemService {
    constructor(
        private customExceptionService: CustomExceptionService,
        private customerRepositoryService: CustomerRepositoryService
    ) { }


    async getDetailItem(lang, idCustomer) {
        try {
            const getCustomer = await this.customerRepositoryService.findOneById(idCustomer);
            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "customer")], HttpStatus.NOT_FOUND)
            return getCustomer;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async addPoints(lang, points, idCustomer, finalFee?: number, customerSetting?) {
        try {
            const getCustomer = await this.getDetailItem(lang, idCustomer);
            getCustomer.point += points
            getCustomer.rank_point += points
            getCustomer.total_price += finalFee || 0;

            if (customerSetting) {
                if (getCustomer.rank_point >= customerSetting.rank_platinum_minium_point) {
                    getCustomer.rank = TYPE_RANK_CUSTOMER.platinum
                } else if (getCustomer.rank_point >= customerSetting.rank_gold_minium_point) {
                    getCustomer.rank = TYPE_RANK_CUSTOMER.gold
                } else if (getCustomer.rank_point >= customerSetting.rank_silver_minium_point) {
                    getCustomer.rank = TYPE_RANK_CUSTOMER.silver
                } else {
                    getCustomer.rank = TYPE_RANK_CUSTOMER.member
                }
            }

            await this.customerRepositoryService.findByIdAndUpdate(getCustomer._id, getCustomer)
            return getCustomer;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async redeemPoints(lang, points, idCustomer) {
        try {
            const getCustomer = await this.getDetailItem(lang, idCustomer);
            getCustomer.point -= points
            await this.customerRepositoryService.findByIdAndUpdate(getCustomer._id, getCustomer)
            return getCustomer;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async addPayPoint(lang, points, idCustomer) {
        try {
            const getCustomer = await this.getDetailItem(lang, idCustomer);
            getCustomer.pay_point += points
            await this.customerRepositoryService.findByIdAndUpdate(getCustomer._id, getCustomer)
            return getCustomer;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async redeemPayPoint(lang, idCustomer, points) {
        try {
            const getCustomer = await this.getDetailItem(lang, idCustomer);
            await this.checkBalancePayPoint(lang, idCustomer, points);
            getCustomer.pay_point -= points;
            await this.customerRepositoryService.findByIdAndUpdate(getCustomer._id, getCustomer)
            return getCustomer;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async checkBalancePayPoint(lang, idCustomer, money, notIgnore = false) {
        try {
            const getCustomer = await this.getDetailItem(lang, idCustomer);
            if (getCustomer.pay_point < money) {
                if(notIgnore) {
                    return false
                }
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.CUSTOMER.NOT_ENOUGH_G_PAY, lang, "pay_point")], HttpStatus.NOT_FOUND)
            }
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async calculateAccumulatePoints(lang, idCustomer, point, customerSetting) {
        try {
            const getCustomer = await this.getDetailItem(lang, idCustomer)
            let accumulatePoints = 0;
            if (getCustomer.rank === TYPE_RANK_CUSTOMER.member) {
                accumulatePoints = point * customerSetting.ratio_of_price_to_point_member;
            } else if (getCustomer.rank === TYPE_RANK_CUSTOMER.silver) {
                accumulatePoints = point * customerSetting.ratio_of_price_to_point_silver;
            }
            else if (getCustomer.rank === TYPE_RANK_CUSTOMER.gold) {
                accumulatePoints = point * customerSetting.ratio_of_price_to_point_gold;
            }
            else if (getCustomer.rank === TYPE_RANK_CUSTOMER.platinum) {
                accumulatePoints = point * customerSetting.ratio_of_price_to_point_platium;
            }

            return accumulatePoints
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async getDetailInviter(idCustomer) {
        try {
            return await this.customerRepositoryService.findOneById(idCustomer);
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async addPointsWhenDoneOrder(lang, finalFee, currentPoint, idCustomer, customerSetting) {
        try {
            let getCustomer = await this.getDetailItem(lang, idCustomer)
            const accumulatePoints = await this.calculateAccumulatePoints(lang, getCustomer._id, currentPoint, customerSetting)
            getCustomer = await this.addPoints(lang, accumulatePoints, getCustomer._id, finalFee, customerSetting)

            return { getCustomer, accumulatePoints }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);

        }
    }

    async getListItemForPushNoti(lstId, lstIdGroupCustomer?) {
        try {
            const query:any = {
                $and: [
                    {_id: { $in: lstId }},
                    {is_delete: false}
                ]
            }
            if(lstIdGroupCustomer && lstIdGroupCustomer.length > 0) {
                query.$and.push({  id_group_customer: { $in: lstIdGroupCustomer } })
            }

            const result = await this.customerRepositoryService.getListDataByCondition(query, { _id: 1, full_name: 1, session_socket: 1 });
            return result
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateSocketCustomer(lang, idCustomer, isDisconnect: boolean = true, sessionSocket?) {
        try {
            let getCustomer = await this.getDetailItem(lang, idCustomer);
            if (isDisconnect) {
                getCustomer.session_socket = null
            } else {
                getCustomer.session_socket = sessionSocket
            }
            getCustomer = await this.customerRepositoryService.findByIdAndUpdate(idCustomer, getCustomer);

            return getCustomer
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getDetailItemForWebSocket(idCustomer) {
        const getCustomer = await this.customerRepositoryService.findOneById(idCustomer);
        return getCustomer;
    }
    
    async updateDataMomoCustomer(lang, token, idCustomer,) {
        try {
            const getCustomer = await this.getDetailItem(lang, idCustomer);
            getCustomer.token_payment_momo = token
            getCustomer.is_link_momo = true
            await this.customerRepositoryService.findByIdAndUpdate(getCustomer._id, getCustomer)
            return getCustomer;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    // async getTokenMomoCustomer(lang, idCustomer) {
    //     try {
    //         const getCustomer = await this.customerRepositoryService.findOneById(idCustomer)
    //         if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, 'customer')], HttpStatus.NOT_FOUND);
    //         return getCustomer?.token_payment_momo;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    //     }
    // }
    async getTokenMomoCustomer(lang, idCustomer) {
        try {
            const getCustomer = await this.customerRepositoryService.findOneById(idCustomer)
            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, 'customer')], HttpStatus.NOT_FOUND);
            return getCustomer?.token_payment_momo;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async isLinkMomoCustomer(lang, idCustomer) {
        try {
            const getCustomer = await this.customerRepositoryService.findOneById(idCustomer)
            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, 'customer')], HttpStatus.NOT_FOUND);
            return getCustomer?.is_link_momo;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getCustomerByPhone(lang, payload, isCheck:boolean = false) {
        try {
            const query:any = {
                $and: [
                    { phone: payload.phone },
                    { code_phone_area: payload.code_phone_area }
                ]
            }

            const getCustomer = await this.customerRepositoryService.findOne(query, {}, { date_create: -1 })
            if (!getCustomer && isCheck) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "customer")], HttpStatus.NOT_FOUND)
            }

            return getCustomer;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async checkPhoneExisted(lang, payload) {
        try {
            const query:any  = {
                $and: [
                    { phone: payload.phone },
                    { code_phone_area: payload.code_phone_area }
                ]
            }

            const getCustomer = await this.customerRepositoryService.findOne(query, {}, { date_create: -1 })
            if (getCustomer) {
                if (getCustomer.is_delete)  {
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.PHONE_NOT_VALID, lang, null)], HttpStatus.BAD_REQUEST);
                }  else {
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.PHONE_EXISTS, lang, null)], HttpStatus.BAD_REQUEST);
                }
            }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async checkEmailExisted(lang, email) {
        try {
            const checkEmailExisted = await this.customerRepositoryService.findOne({ email: email });
            if (checkEmailExisted && email !== "") {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.EMAIL_EXISTS, lang, "email")], HttpStatus.BAD_REQUEST);
            }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async createCustomer(payload) {
        try {
            const customer = await this.customerRepositoryService.create({
                phone: payload.phone,
                code_phone_area: payload.code_phone_area,
                password: payload.password,
                salt: payload.salt,
                name: payload.name || "unknow",
                full_name: payload.full_name || "unknow",
                date_create: new Date(Date.now()).toISOString(),
                email: payload.email || "",
                invite_code: payload.phone,
                id_inviter: payload.id_inviter || null,
                id_customer_inviter: payload.id_customer_inviter || null,
                id_collaborator_inviter: payload.id_collaborator_inviter || null,
                id_customer_referrer: payload.id_customer_referrer || null,
                is_temporary: payload.is_temporary || false,
                pay_point: 0,
                ordinal_number: payload.ordinal_number,
                id_view: payload.id_view,
                index_search: payload.index_search || [],
                promotional_referral_code: payload.promotional_referral_code || null,
                referral_code: payload.referral_code || null,
                get_voucher: payload.get_voucher || false,
                payment_information: payload.payment_information || null,
                payment_method_default: payload.payment_method_default || null,
                city: payload.city || -1,
                district: payload.district || -1,
                tax_code: payload.tax_code || null,
                identity_number: payload.identity_number || null,
                birth_date: payload.birth_date || new Date(Date.now()).toISOString(),
                birthday: payload.birth_date || new Date(Date.now()).toISOString(),
                gender: payload.gender || "other"

            })
            return customer
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async addAPay(lang, idCustomer, finalFee, customerSetting) {
        try {
            const getCustomer = await this.getDetailItem(lang, idCustomer);
            const discount = Math.floor(finalFee * (customerSetting.affiliate_discount_percentage / 100))
            getCustomer.a_pay += discount
            await this.customerRepositoryService.findByIdAndUpdate(getCustomer._id, getCustomer)
            return {customer: getCustomer, money: discount};
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getNumberReferralPersonByCustomer(idCustomer, queryByDate: boolean = false) {
        try {
            const query:any = {
                $and: [
                    { is_delete: false },
                    { id_customer_referrer: idCustomer }
                ]
            }

            if(queryByDate) {
                const now = new Date(new Date(new Date().setHours(23, 59, 59, 99))).toISOString()
                const thirtyDayAgo = new Date(new Date(now).getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
                query.$and.push({date_create: { $gte: thirtyDayAgo, $lt: now }}) 
            }

            return await this.customerRepositoryService.countDataByCondition(query)
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getListPaginationReferralPersonByCustomer(idCustomer, iPage: iPageDTO) {
        try {
            const query = {
                $and: [
                    { is_delete: false },
                    { id_customer_referrer: idCustomer }
                ]
            }
            const select = {
                _id: 1,
                phone: 1,
                full_name: 1,
                email: 1,
                avatar: 1,
                total_price: 1,
                date_create: 1,
                rank: 1
            }
            return await this.customerRepositoryService.getListPaginationDataByCondition(iPage, query, select, { date_create: 1 })

        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getListReferralPersonByCustomer(idCustomer) {
        try {
            const query = {
                $and: [
                    { is_delete: false },
                    { id_customer_referrer: idCustomer }
                ]
            }
            const select = {
                _id: 1,
                phone: 1,
                full_name: 1,
                email: 1,
                avatar: 1,
                total_price: 1,
                date_create: 1,
            }
            return await this.customerRepositoryService.getListDataByCondition(query, select, { date_create: 1 })
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getListCustomerByLstId(lstId, isGetInviter) {
        try {
            const query:any = {
                $and: [
                    { _id: {$in: lstId } },
                ]
            }
            if(isGetInviter) {
                query.$and.push({id_inviter: { $ne: null }} )
            }
            const getCustomer = await this.customerRepositoryService.getListDataByCondition(query)
            return getCustomer
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async checkReferralCode(lang, code, prefix?) {
        try {
            let query:any
            if(prefix && prefix === TYPE_REFERRAL_CODE.promotional) {
                query = {
                    $and: [
                        { promotional_referral_code: code },
                        { is_delete: false }
                    ]
                }
            } else if(prefix && prefix === TYPE_REFERRAL_CODE.discount) {
                query = {
                    $and: [
                        { referral_code: code },
                        { is_delete: false }
                    ]
                }
            } else {
                query = {
                    $and: [
                        { invite_code: code },
                        { is_delete: false }
                    ]
                }
            }

            const getCustomer =  await this.customerRepositoryService.findOne(query)
            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "customer")], HttpStatus.NOT_FOUND)
            return getCustomer
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getNewestCustomer() {
        try {
            return await this.customerRepositoryService.findOne({}, {}, { ordinal_number: -1 }, [], true)
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async updateCustomer(lang, customer) {
        try {
            await this.getDetailItem(lang, customer._id)
            return await this.customerRepositoryService.findByIdAndUpdate(customer._id, customer)
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getNumberReferralPerson(idCustomer) {
        try {
            const query = {
                $and: [
                    { is_delete: false },
                    { id_inviter: idCustomer }
                ]
            }
            return await this.customerRepositoryService.countDataByCondition(query)
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getListPaginationReferralPerson(iPage, idCustomer, isAdmin: boolean = false) {
        try {
            const query = {
                $and: [
                    { is_delete: false },
                    { id_inviter: idCustomer }
                ]
            }

            let select: any
            if(isAdmin) {
                select = {
                    _id: 1,
                    city: 1,
                    code_phone_area: 1,
                    phone: 1,
                    full_name: 1,
                    email: 1,
                    avatar: 1,
                    rank_point: 1,
                    invite_code: 1,
                    id_view: 1,
                    gender: 1,
                    total_price: 1,
                    date_create: 1,
                }
            } else {
                select = { _id: 1, full_name: 1, total_price: 1, date_create: 1 }
            }
           
            const sort = { data_create: -1, _id: 1 }

            return await this.customerRepositoryService.getListPaginationDataByCondition(iPage, query, select, sort)
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getReferralCode(lang, refferalCode, checkForExistence: boolean = false) {
        try {
            const query = {
                $and: [
                    { is_delete: false },
                    { 
                        $or: [
                            { invite_code: refferalCode },
                            { referral_code: `${TYPE_REFERRAL_CODE.discount}${refferalCode}` },
                            { promotional_referral_code: `${TYPE_REFERRAL_CODE.promotional}${refferalCode}` },
                        ]
                    }
                ]
            }
            const getCustomer =  await this.customerRepositoryService.findOne(query)

            if (getCustomer && checkForExistence) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.REFERRAL_CODE_EXISTS, lang, "customer")], HttpStatus.NOT_FOUND)
            }

            return getCustomer
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    
    async getInviteCode(refferalCode) {
        try {
            
            const query = {
                $and: [
                    { invite_code: refferalCode },
                ]
            }
            return await this.customerRepositoryService.findOne(query)
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getCustomerInfo(lang, idCustomer) {
        try {
            const select = {
                phone: 1,
                code_phone_area: 1,
                email: 1,
                name: 1,
                avatar: 1,
                invite_code: 1,
                gender: 1,
                full_name: 1,
                birth_date: 1,
                birthday: 1,
                city: 1,
                district: 1,
                promotional_referral_code: 1,
                referral_code: 1,
                a_pay: 1,
                bank_account: 1,
                tax_code: 1,
                identity_number: 1,
            }
            const getCustomer = await this.customerRepositoryService.findOneById(idCustomer, select);
            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "customer")], HttpStatus.NOT_FOUND)
            return getCustomer;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async minusOrRedeemToReferrerPerson(lang, idCustomer, money, isWithdrawal: boolean = true) {
        try {
            const getCustomer = await this.getDetailItem(lang, idCustomer)
            if(isWithdrawal) {
                getCustomer.a_pay-=money
            } else {
                getCustomer.a_pay+=money
            }

            return await this.customerRepositoryService.findByIdAndUpdate(idCustomer, getCustomer)
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getListCustomerBlockOrFavourite(getCollaborator, iPage) {
      try {
          const query: any = {
            $and: [
              { is_delete: false },
            ],
          };
          if (iPage.status === "favourite") {
            query.$and.push({ id_favourite_collaborator: { $in: [getCollaborator._id] } });
          } else {
            query.$and.push({ id_block_collaborator: { $in: [getCollaborator._id] } });
          }
          
          const sortOption = { date_create: -1 };
          const arrCustomer = await this.customerRepositoryService.getListPaginationDataByCondition(iPage, query, sortOption)

          const result = {
            start: iPage.start,
            length: iPage.length,
            data: arrCustomer
          }
          return result;

      } catch (err) {
          throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    
}
