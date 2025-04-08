import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { addDays, endOfMonth, startOfMonth } from 'date-fns';
import { Model } from 'mongoose';
import { Collaborator, CollaboratorDocument, ERROR, GlobalService, LOOKUP_ADMIN_ACTION, LOOKUP_ADMIN_REFUND, LOOKUP_ADMIN_VERIFY, LOOKUP_COLLABORATOR, PunishCollaboratorDTOAdmin, TranferMoneyCollaboratorDTOAdmin, UserSystem, UserSystemDocument, createPunishCollaboratorDTOAdmin, iPageDTO, previousBalanceCollaboratorDTO } from 'src/@core';
import { Punish, PunishDocument } from 'src/@core/db/schema/punish.schema';
import { CollaboratorRepositoryService } from 'src/@repositories/repository-service/collaborator-repository/collaborator-repository.service';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { ActivityAdminSystemService } from 'src/core-system/activity-admin-system/activity-admin-system.service';
import { CollaboratorSystemService } from 'src/core-system/collaborator-system/collaborator-system.service';

@Injectable()
export class PunishManagerService {
    constructor(
        private globalService: GlobalService,
        private activityAdminSystemService: ActivityAdminSystemService,
        private customExceptionService: CustomExceptionService,
        private collaboratorSystemService: CollaboratorSystemService,
        private collaboratorRepositoryService: CollaboratorRepositoryService,

        @InjectModel(Punish.name) private punishModel: Model<PunishDocument>,
        @InjectModel(Collaborator.name) private collaboratorModel: Model<CollaboratorDocument>,
        @InjectModel(UserSystem.name) private userSystemModel: Model<UserSystemDocument>
    ) { }

    async getListItem(lang, iPage: iPageDTO, admin: UserSystemDocument) {
        try {
            let query: any = {
                $and: [
                    { is_delete: false }
                ]
            }
            // const checkPermisstion = await this.globalService.checkPermissionArea(admin);
            // if (!checkPermisstion.permisstion) {
            //     throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            // }
            // if (admin.id_role_admin["is_area_manager"]) {
            //     checkPermisstion.city.push(-1)
            //     query.$and.push({ 'id_collaborator.city': { $in: checkPermisstion.city } })
            // }
            const arrItem = await this.punishModel.aggregate([
                { $lookup: LOOKUP_COLLABORATOR },
                { $unwind: { path: '$id_collaborator' } },
                { $lookup: LOOKUP_ADMIN_VERIFY },
                { $unwind: { path: '$id_admin_verify', preserveNullAndEmptyArrays: true } },
                { $lookup: LOOKUP_ADMIN_ACTION },
                { $unwind: { path: '$id_admin_action', preserveNullAndEmptyArrays: true } },
                { $lookup: LOOKUP_ADMIN_REFUND },
                { $unwind: { path: '$id_admin_refund', preserveNullAndEmptyArrays: true } },
                { $match: query },
                { $sort: { date_create: -1, _id: 1 } },
                { $skip: Number(iPage.start) },
                { $limit: Number(iPage.length) }
            ])
            const count = await this.punishModel.aggregate([
                { $lookup: LOOKUP_COLLABORATOR },
                { $unwind: { path: '$id_collaborator' } },
                { $match: query },
                { $count: 'total' },
            ])
            const result = {
                start: iPage.start,
                length: iPage.length,
                totalItem: count.length > 0 ? count[0].total : 0,
                data: arrItem
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getListItemV2(lang, iPage: iPageDTO) {
        try {

        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    // chuẩn bị bỏ ở bản sau
    async createItem(lang, idCollaborator, payload: createPunishCollaboratorDTOAdmin, admin: UserSystemDocument) {
        try {
            // const getCollaborator = await this.collaboratorModel.findById(idCollaborator);
            // if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND)
            // const checkPermisstion = await this.globalService.checkPermissionArea(admin, getCollaborator.city);
            // if (!checkPermisstion.permisstion) {
            //     throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            // }
            // const newPunish = new this.punishModel({
            //     id_admin_action: admin._id,
            //     id_collaborator: getCollaborator._id,
            //     date_create: new Date(Date.now()).toISOString(),
            //     date_verify_create: null,
            //     status: "pending",
            //     money: payload.money,
            //     note_admin: payload.punish_note,
            //     id_punish: payload.id_punish,
            //     is_delete: false,
            //     id_admin_verify: null,
            //     is_punish_system: false,
            //     id_order: payload.id_order
            // })
            // await newPunish.save();
            // this.activityAdminSystemService.punishCollaborator(admin._id, idCollaborator, newPunish);
            // return newPunish;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async verifyPunish(lang, id, admin: UserSystemDocument) {
        try {
            const getItem = await this.punishModel.findById(id).populate({ path: 'id_punish' });
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            if (getItem.status === 'done' || getItem.status === 'cancel') throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(getItem.id_collaborator);

            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            getItem.status = "done";
            getItem.date_verify_create = new Date(Date.now()).toISOString();
            getItem.id_admin_verify = admin._id;
            await getItem.save()
            const previousBalance: previousBalanceCollaboratorDTO = {
                remainder: getCollaborator.remainder,
                gift_remainder: getCollaborator.gift_remainder,
                work_wallet: getCollaborator.work_wallet,
                collaborator_wallet: getCollaborator.collaborator_wallet
            }
            if (getCollaborator.work_wallet >= getItem.money) {
                getCollaborator.work_wallet -= getItem.money;

            } else {
                let temp = getCollaborator.work_wallet - getItem.money;
                if (Math.abs(temp) > getCollaborator.collaborator_wallet) {
                    const collab = await this.collaboratorSystemService.changeMoneyWallet(getCollaborator, getCollaborator.collaborator_wallet);
                    getCollaborator.work_wallet = collab.work_wallet - getItem.money;
                    getCollaborator.collaborator_wallet = collab.collaborator_wallet;
                } else {
                    const collaborator = await this.collaboratorSystemService.changeMoneyWallet(getCollaborator, temp);
                    getCollaborator.work_wallet = collaborator.work_wallet - getItem.money;
                    getCollaborator.collaborator_wallet = collaborator.collaborator_wallet;
                }
            }

            await getCollaborator.save();
            this.activityAdminSystemService.adminMonetaryFine(admin._id, getCollaborator._id, getItem, previousBalance);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async systemMonetaryFineCollaborator(lang, idCollaborator, payload: PunishCollaboratorDTOAdmin) {
        try {
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(idCollaborator);

            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND)
            const newPunish = new this.punishModel({
                id_admin_action: null,
                id_collaborator: getCollaborator._id,
                date_verify_create: new Date(Date.now()).toISOString(),
                date_create: new Date(Date.now()).toISOString(),
                status: "done",
                money: payload.money,
                note_admin: payload.punish_note,
                id_punish: payload.id_punish,
                is_delete: false,
                is_punish_system: true,
                id_order: payload.id_order,
                id_info_test_collaborator: payload.id_info_test_collaborator
            })
            await newPunish.save();
            const previousBalance: previousBalanceCollaboratorDTO = {
                remainder: getCollaborator.remainder,
                gift_remainder: getCollaborator.gift_remainder,
                collaborator_wallet: getCollaborator.collaborator_wallet,
                work_wallet: getCollaborator.work_wallet
            }
            let tempMoney = getCollaborator.remainder - newPunish.money;
            getCollaborator.remainder = tempMoney;
            getCollaborator.work_wallet -= newPunish.money;
            await getCollaborator.save();
            this.collaboratorSystemService.balanceMoney(lang, getCollaborator.id);
            if (payload.id_info_test_collaborator) {
                this.activityAdminSystemService.systemMonetaryFinePeriodic(newPunish, previousBalance);
            } else {
                this.activityAdminSystemService.systemMonetaryFine(newPunish, previousBalance);
            }
            return newPunish;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async changeStatusPunishToCancel(lang, id, admin: UserSystemDocument) {
        try {
            const getItem = await this.punishModel.findById(id)
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            if (getItem.status === 'done' || getItem.status === 'cancel') throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(getItem.id_collaborator);

            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND)
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, getCollaborator.city);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            getItem.status = "cancel";
            await getItem.save()
            this.activityAdminSystemService.adminChangeStatusPunishToCancel(admin._id, getItem._id, getCollaborator._id);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async deletePunish(lang, id, admin: UserSystemDocument) {
        try {
            const getItem = await this.punishModel.findById(id)
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(getItem.id_collaborator);

            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND)
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, getCollaborator.city);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            getItem.is_delete = true;
            await getItem.save()
            this.activityAdminSystemService.adminDeletePunish(admin._id, getItem._id, getCollaborator._id);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async adminEditPunish(lang, id, payload: PunishCollaboratorDTOAdmin, admin: UserSystemDocument) {
        try {
            const getPunish = await this.punishModel.findById(id);
            if (!getPunish) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND)
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(getPunish.id_collaborator);

            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND)
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, getCollaborator.city);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            if (getPunish.status === 'done' || getPunish.status === 'cancel') throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            getPunish.money = (payload.money) ? payload.money : getPunish.money
            getPunish.note_admin = (payload.punish_note) ? payload.punish_note : getPunish.note_admin
            getPunish.id_punish = (payload.id_punish) ? payload.id_punish : getPunish.id_punish
            await getPunish.save();
            this.activityAdminSystemService.editPunish(admin._id, getPunish._id);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async adminRefurnPunish(lang, id, admin: UserSystemDocument) {
        try {
            const getPunish = await this.punishModel.findById(id);
            if (!getPunish) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND)
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(getPunish.id_collaborator);

            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND)
            if (getPunish.status !== 'done') throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            const previousBalance: previousBalanceCollaboratorDTO = {
                remainder: getCollaborator.remainder,
                gift_remainder: getCollaborator.gift_remainder,
                collaborator_wallet: getCollaborator.collaborator_wallet,
                work_wallet: getCollaborator.work_wallet

            }
            getCollaborator.remainder += Number(getPunish.money);
            getCollaborator.work_wallet += Number(getPunish.money);
            await getCollaborator.save();
            getPunish.status = 'refund';
            getPunish.id_admin_refund = admin._id
            await getPunish.save();
            await this.activityAdminSystemService.adminRefurnMonetaryFine(getCollaborator._id, getPunish, admin._id, previousBalance);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

}
