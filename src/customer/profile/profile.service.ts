import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { ERROR, GlobalService, iPageDTO, Order, OrderDocument, phoneDTO, Promotion, PromotionDocument, Service, ServiceDocument } from 'src/@core'
import { Customer, CustomerDocument } from 'src/@core/db/schema/customer.schema'
import { HistoryActivity, HistoryActivityDocument } from 'src/@core/db/schema/history_activity.schema'
import { HistoryPoint, HistoryPointDocument } from 'src/@core/db/schema/history_point.schema'
import { CustomerRepositoryService } from 'src/@repositories/repository-service/customer-repository/customer-repository.service'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
import { InviteCodeSystemService } from 'src/core-system/invite-code-system/invite-code-system.service'
import { Collaborator, CollaboratorDocument } from '../../@core/db/schema/collaborator.schema'
import { ActivityCustomerSystemService } from '../../core-system/activity-customer-system/activity-customer-system.service'

@Injectable()
export class ProfileService {
    constructor(
        private globalService: GlobalService,
        private inviteCodeSystemService: InviteCodeSystemService,
        private activityCustomerSystemService: ActivityCustomerSystemService,
        private customExceptionService: CustomExceptionService,
        private customerRepositoryService : CustomerRepositoryService,
        @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
        @InjectModel(HistoryPoint.name) private historyPointModel: Model<HistoryPointDocument>,
        @InjectModel(Promotion.name) private promotionModel: Model<PromotionDocument>,
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
        @InjectModel(HistoryActivity.name) private historyActivityModel: Model<HistoryActivityDocument>,
        @InjectModel(Collaborator.name) private collaboratorModel: Model<CollaboratorDocument>,

    ) { }

    async getInfoByToken(lang, payload: phoneDTO) {
        try {
            const getCustomer = await this.customerModel.findOne({ $and: [{ phone: payload.phone }, { code_phone_area: payload.code_phone_area }] })
                .select({ password: 0, salt: 0 });
            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.PHONE_NOT_FOUND, lang, 'phone')], HttpStatus.BAD_REQUEST);
            return getCustomer;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async getHistoryPoints(lang, iPage: iPageDTO, user) {
        try {
            const query = {
                $and: [{
                    $or: [{
                        name: {
                            $regex: iPage.search,
                            $options: "i"
                        },
                    },]
                },
                {
                    owner_id: user._id
                }
                ]
            }
            const arrItem = await this.historyPointModel.find(query).sort({ date_create: -1, _id: 1 })
                .skip(iPage.start)
                .limit(iPage.length)
                .then();
            const count = await this.historyPointModel.count(query)

            // for(let i = 0 ; i < arrItem.length; i++) {
            //     if(arrItem[i].related === "order") {
            //         const getDetail = await this.orderModel.findById(arrItem[i].related_id);
            //         const getDetailService = await this.serviceModel.findById(getDetail.service._id)
            //         arrItem[i].related = {
            //             getDetail
            //         },

            //     }
            //     if(arrItem[i].related === "exchange_point") {
            //         const getDetail = await this.promotionModel.findById(arrItem[i].related_id);
            //     }
            //     const getDetail
            //     arrItem[i].
            // }

            const result = {
                start: iPage.start,
                length: iPage.length,
                totalItem: count,
                data: arrItem
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || err, HttpStatus.FORBIDDEN);
        }
    }

    async getHistoryPointsV2(lang, iPage: iPageDTO, user) {
        try {
            const query = {
                $and: [
                    {
                        id_customer: user._id
                    },
                    {
                        $or: [
                            { type: { $eq: "customer_collect_points_order" } },
                            { type: { $eq: "customer_exchange_points_promotion" } }
                        ]
                    }
                ]
            }
            const arrItem = await this.historyActivityModel.find(query).sort({ date_create: -1, _id: 1 })
                .skip(iPage.start)
                .limit(iPage.length)
                .then();
            const count = await this.historyActivityModel.count(query)
            const result = {
                start: iPage.start,
                length: iPage.length,
                totalItem: count,
                data: arrItem
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || err, HttpStatus.FORBIDDEN);
        }
    }

    async blockCollaborator(lang, idCollaborator, idUser) {
        try {
            let getCustomer = await this.customerRepositoryService.findOneById(idUser);
            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, 'customer')], HttpStatus.BAD_REQUEST);
            const getCollaborator = await this.collaboratorModel.findById(idCollaborator);
            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, 'collaborator')], HttpStatus.BAD_REQUEST);
            const check = getCustomer.id_block_collaborator.indexOf(idCollaborator);
            const checkFavoutite = getCustomer.id_favourite_collaborator.includes(idCollaborator);
            if (check >= 0) {
                return true;
            }
            if (checkFavoutite) {
                await this.unFavouriteCollaborator(lang, idCollaborator, getCustomer._id);
            }
            getCustomer.id_block_collaborator.push(idCollaborator);
            getCustomer = await this.customerRepositoryService.findByIdAndUpdate(getCustomer._id, getCustomer);
            await this.activityCustomerSystemService.updateFavoriteCollaborator(lang, getCustomer._id);

            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async unblockCollaborator(lang, idCollaborator, idUser) {
        try {
            let getCustomer = await this.customerRepositoryService.findOneById(idUser);
            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, 'customer')], HttpStatus.BAD_REQUEST);
            const getCollaborator = await this.collaboratorModel.findById(idCollaborator);
            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, 'collaborator')], HttpStatus.BAD_REQUEST);
            const check = getCustomer.id_block_collaborator.indexOf(idCollaborator);
            if (check < 0) {
                return false;

            }
            getCustomer.id_block_collaborator = getCustomer.id_block_collaborator.filter((item, index) => {
                return item.toString() !== getCollaborator._id.toString();
            });
            getCustomer = await this.customerRepositoryService.findByIdAndUpdate(getCustomer._id, getCustomer);
            this.activityCustomerSystemService.updateFavoriteCollaborator(lang, getCustomer._id);
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async getListBlockCollaborator(lang, idUser) {
        try {
            const getCustomer = await this.customerModel.findById(idUser)
                .populate({
                    path: 'id_block_collaborator', select: {
                        _id: 1, phone: 1, code_phone_area: 1, avatar: 1, id_view: 1,
                        full_name: 1, name: 1, birthday: 1, star: 1
                    }
                })
                .select({ _id: 1, id_view: 1, name: 1, avatar: 1, full_name: 1 })
            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, 'customer')], HttpStatus.BAD_REQUEST);
            return getCustomer;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async addFavouriteCollaborator(lang, idCollaborator, idUser) {
        try {
            let getCustomer = await this.customerRepositoryService.findOneById(idUser);
            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, 'customer')], HttpStatus.BAD_REQUEST);
            const getCollaborator = await this.collaboratorModel.findById(idCollaborator);
            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, 'collaborator')], HttpStatus.BAD_REQUEST);
            const check = getCustomer.id_favourite_collaborator.indexOf(idCollaborator);
            const checkBlock = getCustomer.id_block_collaborator.indexOf(idCollaborator);
            if (checkBlock >= 0) {
                await this.unblockCollaborator(lang, idCollaborator, getCustomer._id);
            }
            if (check >= 0) {
                return false;
            }
            getCustomer.id_favourite_collaborator.push(idCollaborator);
            getCustomer = await this.customerRepositoryService.findByIdAndUpdate(getCustomer._id, getCustomer);
            this.activityCustomerSystemService.updateFavoriteCollaborator(lang, getCustomer._id);
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async unFavouriteCollaborator(lang, idCollaborator, idUser) {
        try {
            let getCustomer = await this.customerRepositoryService.findOneById(idUser);
            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, 'customer')], HttpStatus.BAD_REQUEST);
            const getCollaborator = await this.collaboratorModel.findById(idCollaborator);
            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, 'collaborator')], HttpStatus.BAD_REQUEST);
            const check = getCustomer.id_favourite_collaborator.indexOf(idCollaborator);
            if (check < 0) {
                return false;
            }
            getCustomer.id_favourite_collaborator = getCustomer.id_favourite_collaborator.filter((item, index) => {
                return item.toString() !== getCollaborator._id.toString();
            });
            getCustomer = await this.customerRepositoryService.findByIdAndUpdate(getCustomer._id, getCustomer);
            this.activityCustomerSystemService.updateFavoriteCollaborator(lang, getCustomer._id);
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async getListFavouriteCollaborator(lang, idUser) {
        try {
            const getCustomer = await this.customerModel.findById(idUser)
                .populate({
                    path: 'id_favourite_collaborator', select: {
                        _id: 1, phone: 1, code_phone_area: 1, avatar: 1, id_view: 1,
                        full_name: 1, name: 1, star: 1, birthday: 1
                    }
                })
                .select({ _id: 1, id_view: 1, name: 1, avatar: 1, full_name: 1 })
            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, 'customer')], HttpStatus.BAD_REQUEST);
            return getCustomer;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async getListCustomerInvite(lang, iPage: iPageDTO, user) {
        try {
            const getCustomer = await this.customerRepositoryService.findOneById(user._id);
            const query = {
                $and: [
                    { is_delete: false },
                    { id_inviter: getCustomer._id }
                ]
            }
            const count = await this.customerModel.count(query)
            const getListCustomer = await this.customerModel.find(query)
                .sort({ date_create: -1, _id: 1 })
                .skip(iPage.start)
                .limit(iPage.length)
                .select({ _id: 1, full_name: 1, total_price: 1, date_create: 1 })
            const arrCustomer = [];
            for (let i = 0; i < getListCustomer.length; i++) {
                let total_order = await this.orderModel.count({ id_delete: false, id_customer: getListCustomer[i]._id });
                let total_done_order = await this.orderModel.count({ id_delete: false, id_customer: getListCustomer[i]._id, status: 'done' });
                let money_after_step_final = 0;
                let money_when_invite = 0;
                if (getListCustomer[i].date_create < '2023-05-30T17:00:00.577Z' && getListCustomer[i].total_price === 0) {
                    total_done_order = 1;
                    total_order = 1;
                }
                if (getListCustomer[i].date_create < '2023-06-08T17:00:00.577Z') {
                    money_after_step_final = 25000;
                } else if (getListCustomer[i].date_create > '2023-06-08T17:00:00.577Z' && getListCustomer[i].date_create < '2023-12-05T02:50:45.748Z') {
                    money_after_step_final = 20000;
                } else {
                    money_after_step_final = 50000;
                }
                if (getListCustomer[i].date_create > '2023-06-08T17:00:00.577Z' && getListCustomer[i].date_create < '2023-12-05T02:50:45.748Z') {
                    money_when_invite = 2000;
                }
                arrCustomer.push({
                    _id: getListCustomer[i]._id,
                    full_name: getListCustomer[i].full_name,
                    date_create: getListCustomer[i].date_create,
                    step_3: total_order > 0,
                    step_4: total_done_order > 0,
                    money_when_invite: money_when_invite,
                    money_after_step_final: money_after_step_final
                });
            }
            const result = {
                start: iPage.start,
                length: iPage.length,
                totalItem: count,
                data: arrCustomer
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async getMoneyFromInvite(lang, user) {
        try {
            const query = {
                $and: [
                    { type: 'system_give_pay_point_customer' },
                    { id_customer: user._id }
                ]
            }
            const getTotalMoney = await this.historyActivityModel.aggregate([
                { $match: query },
                {
                    $group: {
                        _id: {},
                        total_money: {
                            $sum: '$value'
                        }
                    }
                }
            ])
            const result = {
                total_money: getTotalMoney.length > 0 ? getTotalMoney[0].total_money : 0
            }
            return result
        }
        catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getInfoCollaborator(lang, idCollaborator) {
        try {
            const getCollaborator = await this.collaboratorModel.findById(idCollaborator)
                .select({ password: 0, salt: 0, remainder: 0, gift_remainder: 0 })
            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, 'collaborator')], HttpStatus.BAD_REQUEST);
            return getCollaborator
        }
        catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
