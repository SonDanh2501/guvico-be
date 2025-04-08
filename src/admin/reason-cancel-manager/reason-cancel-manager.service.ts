import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ERROR, iPageDTO } from 'src/@core';
import { ReasonCancel, ReasonCancelDocument } from 'src/@core/db/schema/reason_cancel.schema';
import { activeReasonCancelDTOAdmin, createReasonCancelDTOAdmin, deleteReasonCancelDTOAdmin, editReasonCancelDTOAdmin } from 'src/@core/dto/reasonCancel.dto';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { ActivityAdminSystemService } from 'src/core-system/activity-admin-system/activity-admin-system.service';

@Injectable()
export class ReasonCancelManagerService {

    constructor(
        private customExceptionService: CustomExceptionService,
        private activityAdminSystemService: ActivityAdminSystemService,
        @InjectModel(ReasonCancel.name) private reasonCancelModel: Model<ReasonCancelDocument>,
    ) { }


    async getListItem(lang, iPage: iPageDTO) {
        try {
            const query = {
                $and: [
                    { apply_user: { $ne: "system" } },
                    { is_delete: false }
                ]
            }
            const arrItem = await this.reasonCancelModel.find(query)
                .skip(iPage.start)
                .limit(iPage.length).then();
            const count = await this.reasonCancelModel.count(query)
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

    async getListReasonAdmin(lang, iPage: iPageDTO) {
        try {
            const query = {
                $and: [
                    { apply_user: "admin" },
                    { is_active: true },
                    { is_delete: false }
                ]
            }
            const arrItem = await this.reasonCancelModel.find(query)
                .sort({ date_create: -1, _id: -1 })
                .skip(iPage.start)
                .limit(iPage.length);
            const count = await this.reasonCancelModel.count(query)
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
            const item = await this.reasonCancelModel.findById(id)
            return item;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    async createItem(lang, payload: createReasonCancelDTOAdmin, idAdmin: string) {
        try {
            const newItem = new this.reasonCancelModel({
                title: payload.title,
                description: payload.description,
                apply_user: payload.apply_user || "admin",
                note: payload.note,
                date_create: new Date(Date.now()).toISOString(),
            });
            await newItem.save();
            await this.activityAdminSystemService.createReasonCancel(idAdmin, newItem._id);
            return newItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }



    async editItem(lang, payload: editReasonCancelDTOAdmin, id: string, idAdmin: string) {
        try {
            const getItem = await this.reasonCancelModel.findById(id);
            if (!getItem) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            }
            getItem.title = payload.title || getItem.title;
            getItem.description = payload.description || getItem.description;
            getItem.punish_type = payload.punish_type || getItem.punish_type;
            getItem.punish = payload.punish || getItem.punish;
            getItem.punish_cash = payload.punish_cash || getItem.punish_cash;
            getItem.punish_time = payload.punish_time || getItem.punish_time;
            getItem.apply_user = payload.apply_user || getItem.apply_user;
            await getItem.save();
            await this.activityAdminSystemService.editReasonCancel(idAdmin, getItem._id);
            return getItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async activeReasonCancel(lang, payload: activeReasonCancelDTOAdmin, id: string, idAdmin: string) {
        try {
            const getItem = await this.reasonCancelModel.findById(id);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            getItem.is_active = (payload.is_active !== getItem.is_active) ? payload.is_active : getItem.is_active
            await getItem.save();
            await this.activityAdminSystemService.actiReasonCancel(idAdmin, getItem._id);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async deleteReasonCancel(lang, payload: deleteReasonCancelDTOAdmin, id: string, idAdmin: string) {
        try {
            const getItem = await this.reasonCancelModel.findById(id);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            getItem.is_delete = true;
            await getItem.save();
            await this.activityAdminSystemService.deleteReasonCancel(idAdmin, getItem._id);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
