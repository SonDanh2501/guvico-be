import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { getMonth } from 'date-fns'
<<<<<<< HEAD
import { ERROR, MINBALANCE } from 'src/@core'
=======
import { ERROR, iPageDTO, MINBALANCE } from 'src/@core'
>>>>>>> son
import { STATUS_ORDER, TYPE_GROUP_ORDER, WALLET_COLLABORATOR } from 'src/@repositories/module/mongodb/@database/enum'
import { TYPE_ACTION } from 'src/@repositories/module/mongodb/@database/enum/base.enum'
import { CollaboratorRepositoryService } from 'src/@repositories/repository-service/collaborator-repository/collaborator-repository.service'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service'

@Injectable()
export class CollaboratorOopSystemService {
    constructor(
        private customExceptionService: CustomExceptionService, 
        private collaboratorRepositoryService: CollaboratorRepositoryService, 
        private generalHandleService: GeneralHandleService,
    ) { }

    async createItem(payload) {
        try {
            const collaborator = await this.collaboratorRepositoryService.create({
                phone: payload.phone,
                code_phone_area: payload.code_phone_area,
                password: payload.password,
                password_default: null,
                salt: payload.salt,
                full_name: payload.full_name,
                identity_number: payload.identity_number,
                date_create: new Date(Date.now()).toISOString(),
                gender: "other",
                birthday: payload.birthday ? payload.birthday : new Date(Date.now()).toISOString(),
                city: payload.city,
                district: payload.district,
                email: payload.email || "",
                avatar: payload.avatar,
                device_token: payload.device_token || "",
                invite_code: payload.invite_code,
                id_inviter: payload.id_inviter,
                month_birthday: getMonth(new Date(Date.now())),
                id_view: payload.id_view,
                ordinal_number: payload.ordinal_number,
                type: payload.type,
                desire_service: payload.desire_service,
                index_search: payload.index_search,
                promotional_referral_code: payload.promotional_referral_code,
                referral_code: payload.referral_code,
            })

            return collaborator
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getDetailItem(lang, idItem) {
        try {
            const getItem = await this.collaboratorRepositoryService.findOneById(idItem);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "collaborator")], HttpStatus.NOT_FOUND)
            return getItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getDetailItemForAccumlation(lang, idItem) {
        try {
            const selectOption = { _id: 1, full_name: 1, reward_point: 1, number_of_violation: 1, lock_start_time: 1, lock_end_time: 1 }
            const getItem = await this.collaboratorRepositoryService.findOneById(idItem, selectOption);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "collaborator")], HttpStatus.NOT_FOUND)
            return getItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async lockCollaborator(lang, idCollaborator) {
        try {
            const item = await this.getDetailItem(lang, idCollaborator);
            item.is_lock = true;
            await this.collaboratorRepositoryService.findByIdAndUpdate(item._id, item);
            return item;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async refundCollaborator(lang, idCollaborator, type_wallet, money) {
        try {
            const item = await this.getDetailItem(lang, idCollaborator);
            item[type_wallet] += money;
            await this.collaboratorRepositoryService.findByIdAndUpdate(item._id, item);
            return item;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async addPointWallet(lang, idCollaborator, type_wallet, money) {
        try {
            let item = await this.getDetailItem(lang, idCollaborator);
            item[type_wallet] += money;

            return await this.collaboratorRepositoryService.findByIdAndUpdate(item._id, item);
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async minusCollaborator(lang, idCollaborator, money, type_group_order, type_action, noCheckIgnoreBalance?) {
        try {
            const ignoreBalance = (noCheckIgnoreBalance === false) ? noCheckIgnoreBalance : true;
            let item = await this.getDetailItem(lang, idCollaborator);
            if(type_group_order === TYPE_GROUP_ORDER.schedule) {
                item.collaborator_wallet -= money
                item = await this.collaboratorRepositoryService.findByIdAndUpdate(item._id, item);
            } else {
                item.work_wallet -= money;
                if (item.work_wallet < 0) {
                    if(type_action === TYPE_ACTION.confirm_job) {
                        throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_ENOUGH_MONEY, lang, `collaborator_work_wallet`)], HttpStatus.NOT_FOUND)
                    }

                    item = await this.convertMoneyBetweenWallets(lang, idCollaborator, Math.abs(item.work_wallet), WALLET_COLLABORATOR.collaborator_wallet, WALLET_COLLABORATOR.work_wallet, ignoreBalance)
                } else {
                    item = await this.collaboratorRepositoryService.findByIdAndUpdate(item._id, item);
                }
            }
            
            return item;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async convertMoneyBetweenWallets(lang, idCollaborator, money, walletOut, walletIn, ignoreBalance) {
        try {
            const item = await this.getDetailItem(lang, idCollaborator);
            if (item[walletOut] < money && ignoreBalance === true) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_ENOUGH_MONEY, lang, `collaborator_${walletOut}`)], HttpStatus.NOT_FOUND)
            }
            item[walletOut] -= money
            item[walletIn] = 0

            if (item[walletOut] < 0 && walletOut === WALLET_COLLABORATOR.collaborator_wallet) {
                item[walletIn] = item[walletOut]
                item[walletOut] = 0
            }

            await this.collaboratorRepositoryService.findByIdAndUpdate(item._id, item);
            return item;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async deductMoney(lang, idCollaborator, money, typeWallet?) {
        try {
            const item = await this.getDetailItem(lang, idCollaborator);
            item.collaborator_wallet -= money;
            if (item.collaborator_wallet < MINBALANCE) {
                const property = {
                    min_balance: this.generalHandleService.formatMoney(MINBALANCE)
                }
                throw new HttpException([await this.customExceptionService.i18nErrorWithProperty(ERROR.COLLABORATOR.MIN_BALANCE, lang, property, `collaborator_wallet`)], HttpStatus.NOT_FOUND)
            }
            await this.collaboratorRepositoryService.findByIdAndUpdate(item._id, item)
            return item;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async checkBalanceWallet(lang, idCollaborator, money) {
        try {
            const item = await this.getDetailItem(lang, idCollaborator);
            if (item.work_wallet < money) throw new HttpException([await this.customExceptionService.i18nErrorWithProperty(ERROR.NOT_ENOUGH_MONEY, lang, `collaborator_wallet`)], HttpStatus.NOT_FOUND)
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getCollaboratorForGroupOrder(groupOrder) {
        try {
            const query = {
                $and: [
                    { city: groupOrder.city },
                    { service_apply: { $in: [groupOrder.service._id] } },
                    { is_locked: false },
                    { _id: { $nin: groupOrder.id_block_collaborator } }
                ]
            }
            // console.log(query, 'query');

            const getData = await this.collaboratorRepositoryService.getListDataByCondition(query, { _id: 1, full_name: 1, session_socket: 1 }, { star: -1 });
            // console.log(getData.length, "getCollaboratorForGroupOrder");

            return getData;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getCollaboratorFavourite(groupOrder) {
        try {

            const query = {
                $and: [
                    { city: groupOrder.city },
                    { service_apply: groupOrder.service._id },
                    { is_locked: false },
                    { _id: { $in: groupOrder.id_favourite_collaborator } }
                ]
            }
            const getData = await this.collaboratorRepositoryService.getListDataByCondition(query, { _id: 1, full_name: 1, session_socket: 1 });
            return getData;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateCollaboratorPersonalInformation(lang, idCollaborator, payload) {
        try {
            // Lấy thông tin của CTV đang chỉnh sửa để 
            // Nếu payload không truyền vào giá trị chỉnh sửa thì phải trả về đúng giá trị ban đầu
            const getCollaborator = await this.getDetailItem(lang, idCollaborator);

            // Kiểm tra số điện thoại này đã tồn tại trong DB hay chưa
            // 1. Tìm trong DB xem có số nào trùng số và trùng luôn cả phân vùng
            const checkPhoneExisted = await this.collaboratorRepositoryService.findOne({ $and: [{ phone: payload.phone }, { code_phone_area: payload.code_phone_area }] });
            // 2. Nếu số điện thoại đã tồn tại thì báo lỗi (loại trừ đi trường hợp tự bản thân nó bằng chính nó)
            if (checkPhoneExisted && checkPhoneExisted.phone !== getCollaborator.phone) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.PHONE_EXISTS, lang, null)], HttpStatus.BAD_REQUEST);
            }
            // Kiểm tra đối với một vài trường bắt buộc (Họ tên, số điện thoại)
            if (payload.full_name && payload.full_name === "") {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.COLLABORATOR.NAME_NOT_VALID, lang, null)], HttpStatus.BAD_REQUEST);
            }
            if (payload.phone && payload.phone === "") {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.PHONE_NOT_VALID, lang, null)], HttpStatus.BAD_REQUEST);
            }

            const low = payload.full_name.toLocaleLowerCase() || getCollaborator.full_name;
            const nomark = await this.generalHandleService.cleanAccents(low);
            const indexSearch = [payload.phone || getCollaborator.phone, low, nomark]

            const newPayload = {
                full_name: payload.full_name || getCollaborator.full_name,
                phone: payload.phone || getCollaborator.phone,
                email: payload.email || getCollaborator.email,
                identity_number: payload.identity_number || getCollaborator.identity_number,
                birthday: payload.birthday || getCollaborator.birthday,
                identity_place: payload.identity_place || getCollaborator.identity_place,
                identity_date: payload.identity_date || getCollaborator.identity_date,
                gender: payload.gender || getCollaborator.gender,
                country: payload.country || getCollaborator.country,
                home_town: payload.home_town || getCollaborator.home_town,
                province_live: payload.province_live || getCollaborator.province_live,
                district_live: payload.district_live || getCollaborator.district_live,
                address_live: payload.address_live || getCollaborator.address_live,
                province_temp: payload.province_temp || getCollaborator.province_temp,
                district_temp: payload.district_temp || getCollaborator.district_temp,
                address_temp: payload.address_temp || getCollaborator.address_temp,
                folk: payload.folk || getCollaborator.folk,
                religion: payload.religion || getCollaborator.religion,
                edu_level: payload.edu_level || getCollaborator.edu_level,
                service_apply: payload.service_apply || getCollaborator.service_apply,
                skills_list: payload.skills_list || getCollaborator.skills_list,
                languages_list: payload.languages_list || getCollaborator.languages_list,
                // province_work: payload.province_work || getCollaborator.province_work,
                // district_work: payload.district_work || getCollaborator.district_work,
                contact_persons: payload.contact_persons || getCollaborator.contact_persons,
                id_inviter: payload.id_inviter || getCollaborator.id_inviter,
                id_collaborator_inviter: payload.id_collaborator_inviter ||  getCollaborator.id_collaborator_inviter,
                avatar: payload.avatar || getCollaborator.avatar,
                type: payload.type || getCollaborator.type,
                index_search: indexSearch,
                city: payload.city || getCollaborator.city,
                district: payload.district || getCollaborator.district,
            }
            const result = await this.collaboratorRepositoryService.findByIdAndUpdate(idCollaborator, newPayload);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    async updateCollaboratorBankInformation(lang, idCollaborator, payload) {
        try {
            const getCollaborator = await this.getDetailItem(lang, idCollaborator);
            const newPayload = {
                account_number: payload.account_number || getCollaborator.account_number,
                account_name: payload.account_name || getCollaborator.account_name,
                bank_name: payload.bank_name || getCollaborator.bank_name,
                bank_brand: payload.bank_brand || getCollaborator.bank_brand,
            }
            const result = await this.collaboratorRepositoryService.findByIdAndUpdate(idCollaborator, newPayload);
            return result;
        } catch (err) {

        }
    }

    async updateSocketCollaborator(lang, idCollaborator, isDisconnect: boolean = true, sessionSocket?) {
        try {
            let getCollaborator = await this.getDetailItem(lang, idCollaborator);
            if (isDisconnect) {
                getCollaborator.session_socket = null
            } else {
                getCollaborator.session_socket = sessionSocket
            }
            getCollaborator = await this.collaboratorRepositoryService.findByIdAndUpdate(idCollaborator, getCollaborator);

            return getCollaborator
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);

        }
    }

    async getDetailInviter(idCollaborator) {
        try {
            const query = {
                $and: [
                    { _id: idCollaborator },
                    { status: "actived" }
                ]
            }
            return await this.collaboratorRepositoryService.findOne(query);
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getDetailItemForWebSocket(idCollaborator) {
        return await this.collaboratorRepositoryService.findOneById(idCollaborator);
    }

    async getDesireService(idCollaborator) {
        try {
            const result = await this.collaboratorRepositoryService.findOneById(idCollaborator);
            return result.desire_service
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getReferralCode(referralCode) {
        try {
            const query = {
                $and: [
                    { invite_code: referralCode },
                ]
            }
            return await this.collaboratorRepositoryService.findOne(query)
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async checkReferralCode(lang, code) {
        try {
            let query = {
                $and: [
                    { invite_code: code },
                    { is_delete: false }
                ]
            }

            const getCollaborator = await this.collaboratorRepositoryService.findOne(query)
            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "collaborator")], HttpStatus.NOT_FOUND)

            return getCollaborator
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
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

            const getCollaborator = await this.collaboratorRepositoryService.findOne(query, {}, { date_create: -1 })
            if (getCollaborator) {
                if (getCollaborator.is_delete)  {
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
            const checkEmailExisted = await this.collaboratorRepositoryService.findOne({ email: email });
            if (checkEmailExisted && (email !== "" && email !== null && email !== undefined)) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.EMAIL_EXISTS, lang, "email")], HttpStatus.BAD_REQUEST);
            }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateCollaborator(lang, collaborator) {
        try {
            await this.getDetailItem(lang, collaborator._id)
            return await this.collaboratorRepositoryService.findByIdAndUpdate(collaborator._id, collaborator)
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getListCollaborator(query, sort) {
        try {
            return await this.collaboratorRepositoryService.getListDataByCondition(query, {}, sort)
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getListActivatedCollaboratorWithinSomeDays(someDays) {
        try {
            const query = [
                { 
                    $match: { 
                        date_actived: { $gte: someDays },
                        $or: [
                            { id_customer_inviter: { $ne: null } },
                            { id_collaborator_inviter: { $ne: null } }
                        ],
                        is_added_gift_remainder: false,
                        is_delete: false,
                        status: "actived",
                    } 
                },
                // Noi voi bang orders
                { 
                    $lookup: { 
                        from: "orders", 
                        localField: "_id", 
                        foreignField: "id_collaborator", 
                        as: "orders" 
                    } 
                },
                // Tinh tong so ca lam va so danh gia tot 
                { 
                    $addFields: { 
                        doneOrders: { 
                            $size: { 
                                $filter: { 
                                    input: "$orders", 
                                    as: "order", 
                                    cond: { 
                                        $and: [
                                            { $eq: ["$$order.status", STATUS_ORDER.done] },
                                            { 
                                                $lt: ["$$order.end_date_work", { 
                                                    $dateAdd: { 
                                                        startDate: { $toDate: "$date_actived" }, 
                                                        unit: "day", 
                                                        amount: 30 
                                                    } 
                                                }]
                                            }
                                        ]
                                    } 
                                } 
                            } 
                        }, 
                        goodReviews: { 
                            $size: { 
                                $filter: { 
                                    input: "$orders", 
                                    as: "order", 
                                    cond: { 
                                        $and: [
                                            {  $gte: ["$$order.star", 4] },
                                            {  $eq: ["$$order.is_system_review", false] }
                                        ]
                                    } 
                                } 
                            } 
                        } 
                    } 
                },
                { 
                    $match: { 
                        doneOrders: { $gte: 5 }, 
                        goodReviews: { $gte: 3 }, 
                    } 
                },
                {
                    $sort: { date_create: 1 }
                }
            ]
            return await this.collaboratorRepositoryService.aggregateQuery(query)
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async addAPoints(lang, idCollaborator, finalFee, customerSetting) {
        try {
            const getCollaborator = await this.getDetailItem(lang, idCollaborator);
            const discount = Math.floor(finalFee * (customerSetting.affiliate_discount_percentage / 100))
            getCollaborator.a_pay += discount
            await this.collaboratorRepositoryService.findByIdAndUpdate(getCollaborator._id, getCollaborator)
            return getCollaborator;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getListItem(query) {
        try {
            const result = await this.collaboratorRepositoryService.getListDataByCondition(query, { _id: 1, full_name: 1, session_socket: 1 });
            return result
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getListCollaboratorById(lstId) {
        let query = {
            $and: [
                { _id: { $in: lstId } }
            ]
        }

        return await this.collaboratorRepositoryService.getListDataByCondition(query)
    }

    async minusRewardMoney(lang, idCollaborator, typeWallet, money) {
        try {
            const item = await this.getDetailItem(lang, idCollaborator);
            item[typeWallet] -= money;
            await this.collaboratorRepositoryService.findByIdAndUpdate(item._id, item)
            return item;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async minusRewardPointAndUpdateTime(lang, idCollaborator, point, lastPointUpdatedAt?) {
        try {
            const item = await this.getDetailItem(lang, idCollaborator);
            item.reward_point -= point;
            item.monthly_reward_point -= point;
            if(lastPointUpdatedAt !== null && lastPointUpdatedAt !== undefined) {
                item.last_point_updated_at = lastPointUpdatedAt
                item.monthly_last_point_updated_at = lastPointUpdatedAt
            }
            await this.collaboratorRepositoryService.findByIdAndUpdate(item._id, item)
            return item;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    async getPaginationCurrentLeaderBoard(iPage: iPageDTO) {
        try {
            const query = {
                $and: [
                    { status: "actived" },
                    { reward_point: { $gt: 0 } },
                    { number_of_violation: 0 },
                ]
            }

            const select = {
                full_name: 1,
                avatar: 1,
                reward_point: 1,
                top1_count: 1,
                top2_count: 1,
                top3_count: 1,
                last_point_updated_at: 1
            }

            const sort = { reward_point: -1, last_point_updated_at: 1 }

            return await this.collaboratorRepositoryService.getListPaginationDataByCondition(iPage, query, select, sort)
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    async getCurrentLeaderBoard() {
        try {
            const query = {
                $and: [
                    { status: "actived" },
                    { reward_point: { $gt: 0 } },
                    { number_of_violation: 0 },
                ]
            }

            const select = {
                full_name: 1,
                avatar: 1,
                reward_point: 1,
                top1_count: 1,
                top2_count: 1,
                top3_count: 1,
                last_point_updated_at: 1,
                monthly_number_of_violation: 1
            }

            const sort = { reward_point: -1, last_point_updated_at: 1 }
            return await this.collaboratorRepositoryService.getListDataByCondition(query, select, sort)
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getListCollaboratorHaveRewardPoint() {
        try {
            const query = {
                $and: [
                    { reward_point: { $gt: 0 } },
                ]
            }

            const select = {
                full_name: 1,
                reward_point: 1,
                last_point_updated_at: 1,
                number_of_violation: 1,
            }
            
            return await this.collaboratorRepositoryService.getListDataByCondition(query, select)
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getListCollaboratorHaveMonthlyRewardPoint() {
        try {
            const query = {
                $and: [
                    { monthly_reward_point: { $gt: 0 } },
                ]
            }

            const select = {
                full_name: 1,
                monthly_reward_point: 1,
                monthly_last_point_updated_at: 1,
                is_not_received_reward: 1,
                monthly_number_of_violation: 1,
            }

            return await this.collaboratorRepositoryService.getListDataByCondition(query, select)
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getCurrentRank(lang, idCollaborator) {
        try {
            await this.getDetailItem(lang, idCollaborator) 
            const getCurrentLeaderBoard = await this.getCurrentLeaderBoard()
            const rank = getCurrentLeaderBoard.findIndex((e) => e._id.toString() === idCollaborator.toString()) + 1

            return rank > 0 ? rank : null
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getListActivedCollaborator() {
        try {
            const query = {
                $and: [
                    { status: "actived" }
                ]
            }
            return await this.collaboratorRepositoryService.getListDataByCondition(query, {}, { date_create: 1})
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async queryAutomation(item) {
        try {

            const query: any = [
                {
                    $match: {
                        $and: []
                    }
                }
            ]


            for (const condition of item.condition) {
                if (condition.type_condition === "number" || condition.type_condition === "string") {
                    if (condition.operator === ">=") {
                        query[0].$match.$and.push({ [condition.kind]: { $gte: condition.value } })
                    } else if (condition.operator === ">") {
                        query[0].$match.$and.push({ [condition.kind]: { $gt: condition.value } })
                    } else if (condition.operator === "=<") {
                        query[0].$match.$and.push({ [condition.kind]: { $lte: condition.value } })
                    } else if (condition.operator === "<") {
                        query[0].$match.$and.push({ [condition.kind]: { $lt: condition.value } })
                    } else if (condition.operator === "!=") {
                        query[0].$match.$and.push({ [condition.kind]: { $ne: condition.value } })
                    } else {
                        query[0].$match.$and.push({ [condition.kind]: condition.value })
                    }
                } else {
                    switch (condition.kind) {
                        case "status": {
                            break;
                        }
                        default: break;
                    }
                }
            }

            const result = await this.collaboratorRepositoryService.aggregateQuery(query);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getPaginationCurrentMonthlyLeaderBoard(iPage: iPageDTO) {
        try {
            const query = {
                $and: [
                    { is_not_received_reward: false },
                    { status: "actived" },
                    { monthly_reward_point: { $gt: 0 } },
                    { monthly_number_of_violation: 2 },
                ]
            }

            const select = {
                full_name: 1,
                avatar: 1,
                monthly_reward_point: 1,
                monthly_top1_count: 1,
                monthly_top2_count: 1,
                monthly_top3_count: 1,
                monthly_last_point_updated_at: 1
            }

            const sort = { monthly_reward_point: -1, monthly_last_point_updated_at: 1 }
            return await this.collaboratorRepositoryService.getListPaginationDataByCondition(iPage, query, select, sort)
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getCurrentMonthlyLeaderBoard() {
        try {
            const query = {
                $and: [
                    { is_not_received_reward: false },
                    { status: "actived" },
                    { monthly_reward_point: { $gt: 0 } },
                    { monthly_number_of_violation: 2 },
                ]
            }

            const select = {
                full_name: 1,
                avatar: 1,
                monthly_reward_point: 1,
                monthly_top1_count: 1,
                monthly_top2_count: 1,
                monthly_top3_count: 1,
                monthly_last_point_updated_at: 1,
            }

            const sort = { monthly_reward_point: -1, monthly_last_point_updated_at: 1 }
            return await this.collaboratorRepositoryService.getListDataByCondition(query, select, sort)
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getCurrentMonthlyRank(lang, idCollaborator) {
        try {
            await this.getDetailItem(lang, idCollaborator) 
            const getCurrentMonthlyLeaderBoard = await this.getCurrentMonthlyLeaderBoard()
            const rank = getCurrentMonthlyLeaderBoard.findIndex((e) => e._id.toString() === idCollaborator.toString()) + 1

            return rank > 0 ? rank : null
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

