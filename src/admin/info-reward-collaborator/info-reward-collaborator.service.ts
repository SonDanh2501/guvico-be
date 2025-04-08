import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
    Collaborator, CollaboratorDocument, ERROR, InfoRewardCollaborator,
    InfoRewardCollaboratorDocument, LOOKUP_ADMIN_VERIFY, LOOKUP_COLLABORATOR,
    LOOKUP_ID_ORDER, LOOKUP_ID_REWARD_COLLABORATOR, Order, PROJECT_GET_LIST, iPageInfoRewardCollaborator,
    payloadCreateInfoRewardCollaborator, POP_CUSTOMER_INFO,
} from 'src/@core';
import { Punish, PunishDocument } from 'src/@core/db/schema/punish.schema';
import { CollaboratorRepositoryService } from 'src/@repositories/repository-service/collaborator-repository/collaborator-repository.service';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { ActivityAdminSystemService } from 'src/core-system/activity-admin-system/activity-admin-system.service';
@Injectable()
export class InfoRewardCollaboratorService {
    constructor(
        private customExceptionService: CustomExceptionService,
        private activityAdminSystemService: ActivityAdminSystemService,
        private collaboratorRepositoryService: CollaboratorRepositoryService,

        @InjectModel(Collaborator.name) private collaboratorModel: Model<CollaboratorDocument>,
        @InjectModel(Order.name) private orderModel: Model<CollaboratorDocument>,
        @InjectModel(Punish.name) private punishModel: Model<PunishDocument>,
        @InjectModel(InfoRewardCollaborator.name) private infoRewardCollaboratorModel: Model<InfoRewardCollaboratorDocument>,


    ) { }

    async getListItem(lang, iPage: iPageInfoRewardCollaborator) {
        try {
            let query: any = {
                $and: [
                    { is_delete: false },
                    {
                        $or: [
                            {
                                'id_collaborator.phone': {
                                    $regex: iPage.search,
                                }
                            },
                            {
                                'id_collaborator.id_view': {
                                    $regex: iPage.search,
                                }
                            },
                            {
                                'id_collaborator.full_name': {
                                    $regex: iPage.search,
                                }
                            }
                        ]
                    }
                ]
            };
            if (iPage.status !== 'all') {
                query.$and.push({ status: iPage.status });
            }
            const getListReward = await this.infoRewardCollaboratorModel.aggregate([
                { $lookup: LOOKUP_COLLABORATOR },
                { $unwind: { path: '$id_collaborator' } },
                { $match: query },
                { $sort: { date_create: -1, _id: 1 } },
                { $skip: Number(iPage.start) },
                { $limit: Number(iPage.length) },
                { $lookup: LOOKUP_ADMIN_VERIFY },
                { $lookup: LOOKUP_ID_ORDER },
                { $unwind: { path: '$id_admin_verify', preserveNullAndEmptyArrays: true } },
                { $lookup: LOOKUP_ID_REWARD_COLLABORATOR },
                { $unwind: { path: '$id_reward_collaborator', preserveNullAndEmptyArrays: true } },
                {
                    $project: PROJECT_GET_LIST
                },

            ]);
            const count = await this.infoRewardCollaboratorModel.aggregate([
                { $lookup: LOOKUP_COLLABORATOR },
                { $unwind: { path: '$id_collaborator' } },
                { $match: query },
                { $count: 'total' }
            ]);
            const result = {
                start: Number(iPage.start),
                length: Number(iPage.length),
                totalItem: count.length > 0 ? Number(count[0].total) : 0,
                data: getListReward
            }
            return result;
        }
        catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async createItem(lang, payload: payloadCreateInfoRewardCollaborator, admin?) {
        try {
            const newItem = new this.infoRewardCollaboratorModel({
                id_collaborator: payload.id_collaborator,
                total_job_hour: payload.total_job_hour,
                total_order: payload.total_order,
                id_reward_collaborator: payload.id_reward_collaborator,
                money: payload.money,
                id_order: payload.id_order,
                id_admin_action: admin ? admin._id : null,
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            this.activityAdminSystemService.createInfoRewardCollaborator(newItem._id.toString());
            return newItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    async verifyItem(lang, idInfo, admin) {
        try {
            const getInfo = await this.infoRewardCollaboratorModel.findById(idInfo).populate({ path: 'id_reward_collaborator' });
            if (!getInfo) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            if (getInfo.is_verify === true || getInfo.status === 'done' || getInfo.status === 'cancel') throw new HttpException([await this.customExceptionService.i18nError(ERROR.DO_NOT_CHANGE_STATUS, lang, null)], HttpStatus.BAD_REQUEST);
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(getInfo.id_collaborator);
            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            const previousBalance = {
                remainder: getCollaborator.remainder,
                gift_remainder: getCollaborator.gift_remainder
            }
            if (getInfo.id_reward_collaborator["type_wallet"] === 'wallet') {
                getCollaborator.remainder += getInfo.money
                await getCollaborator.save();
            } else if (getInfo.id_reward_collaborator["type_wallet"] === 'gift_wallet') {
                getCollaborator.gift_remainder += getInfo.money
                await getCollaborator.save();
            } else {
                return false;
            }
            getInfo.is_verify = true;
            getInfo.status = 'done';
            getInfo.date_verify = new Date(Date.now()).toISOString();
            getInfo.id_admin_verify = admin._id.toString();
            await getInfo.save();
            this.activityAdminSystemService.verifyInfoRewardCollaborator(getInfo, previousBalance);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    async deteleItem(lang, idInfo, admin) {
        try {
            const getInfo = await this.infoRewardCollaboratorModel.findById(idInfo);
            if (!getInfo) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            if (getInfo.is_verify === true || getInfo.status === 'done') throw new HttpException([await this.customExceptionService.i18nError(ERROR.DO_NOT_CHANGE_STATUS, lang, null)], HttpStatus.BAD_REQUEST);
            getInfo.is_delete = true;
            await getInfo.save();
            this.activityAdminSystemService.deleteInfoRewardCollaborator(admin._id.toString(), getInfo);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getDetailItem(lang, idInfo, admin) {
        try {
            const getInfo = await this.infoRewardCollaboratorModel.findById(idInfo)
                .populate({ path: 'id_collaborator', select: { _id: 1, full_name: 1, phone: 1, code_phone_area: 1, id_view: 1, avatar: 1 } })
                .populate({ path: 'id_admin_action', select: { _id: 1, full_name: 1, } })
                .populate({ path: 'id_admin_verify', select: { _id: 1, full_name: 1, } })
                .populate({ path: 'id_order', select: { _id: 1, id_view: 1, date_work: 1, final_fee: 1, total_estimate: 1, id_group_order: 1, address: 1, id_customer: 1 } })
            if (!getInfo) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            return getInfo;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async cancelItem(lang, idInfo, payload, admin) {
        try {
            const getInfo = await this.infoRewardCollaboratorModel.findById(idInfo)
            if (!getInfo) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            if (getInfo.status === 'done' || getInfo.status === 'cancel') throw new HttpException([await this.customExceptionService.i18nError(ERROR.DO_NOT_CHANGE_STATUS, lang, null)], HttpStatus.BAD_REQUEST);
            getInfo.status = 'cancel';
            getInfo.note_admin = payload.note_admin;
            await getInfo.save();
            this.activityAdminSystemService.cancelInfoRewardCollaborator(admin._id.toString(), getInfo);
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async noteAdminItem(lang, idInfo, payload, admin) {
        try {
            const getInfo = await this.infoRewardCollaboratorModel.findById(idInfo)
            if (!getInfo) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            getInfo.note_admin = payload.note_admin;
            await getInfo.save();
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
