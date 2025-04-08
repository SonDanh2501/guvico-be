import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ERROR, iPageDTO } from 'src/@core';
import { ReasonPunish, ReasonPunishDocument } from 'src/@core/db/schema/reason_punish.schema';
import { activeReasonCancelDTOAdmin, createReasonCancelDTOAdmin, deleteReasonCancelDTOAdmin, editReasonCancelDTOAdmin } from 'src/@core/dto/reasonCancel.dto';
import { createReasonPunishDTOAdmin, iPagePunishDTOAdmin } from 'src/@core/dto/reasonPunish.dto';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { ActivityAdminSystemService } from 'src/core-system/activity-admin-system/activity-admin-system.service';

@Injectable()
export class ReasonPunishManagerService {
    constructor(
        private customExceptionService: CustomExceptionService,
        private activityAdminSystemService: ActivityAdminSystemService,
        @InjectModel(ReasonPunish.name) private reasonPunishModel: Model<ReasonPunishDocument>,
    ) { }

    async getListItem(lang, iPage: iPagePunishDTOAdmin) {
        try {
            let query: any = {
                $and: [
                    { is_delete: false }
                ]
            };
            if (iPage.apply_user !== 'all') {
                query.$and.push({ apply_user: iPage.apply_user });
            }
            const arrItem = await this.reasonPunishModel.find(query)
                .sort({ date_create: -1 })
                .skip(iPage.start)
                .limit(iPage.length);
            const count = await this.reasonPunishModel.count(query);
            const result = {
                start: iPage.start,
                length: iPage.length,
                totalItem: count,
                data: arrItem
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);

        }
    }

    async getDetailItem(lang, id: string) {
        try {
            const item = await this.reasonPunishModel.findById(id)
            return item;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async createItem(lang, payload: createReasonPunishDTOAdmin, idAdmin: string) {
        try {
            const newItem = new this.reasonPunishModel({
                title: payload.title,
                description: payload.description,
                note: payload.note || null,
                apply_user: payload.apply_user,
                date_create: new Date(Date.now()).toISOString(),
            });
            await newItem.save();
            this.activityAdminSystemService.createReasonPunish(idAdmin, newItem._id);
            return newItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async editItem(lang, payload: editReasonCancelDTOAdmin, id: string, idAdmin: string) {
        try {
            const getItem = await this.reasonPunishModel.findById(id);
            if (!getItem) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            }
            getItem.title = payload.title || getItem.title
            getItem.description = payload.description || getItem.description
            getItem.note = payload.note || getItem.note
            getItem.apply_user = payload.apply_user || getItem.apply_user
            await getItem.save();
            this.activityAdminSystemService.editReasonPunish(idAdmin, getItem._id);
            return getItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async activeReasonPunish(lang, payload: activeReasonCancelDTOAdmin, id: string, idAdmin: string) {
        try {
            const getItem = await this.reasonPunishModel.findById(id);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            getItem.is_active = (payload.is_active !== getItem.is_active) ? payload.is_active : getItem.is_active
            await getItem.save();
            await this.activityAdminSystemService.actiReasonPunish(idAdmin, getItem._id);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async deleteReasonPunish(lang, id: string, idAdmin: string) {
        try {
            const getItem = await this.reasonPunishModel.findById(id);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            getItem.is_delete = true;
            await getItem.save();
            this.activityAdminSystemService.deleteReasonPunish(idAdmin, getItem._id);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
