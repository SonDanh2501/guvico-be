import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ERROR, GlobalService, iPageDTO } from 'src/@core';
import { CollaboratorBonus, CollaboratorBonusDocument } from 'src/@core/db/schema/collaborator_bonus.schema';
import { actiCollaboratorBonusDTOAdmin, createCollaboratorBonusDTOAdmin, editCollaboratorBonusDTOAdmin } from 'src/@core/dto/collaboratorBonus.dto';
import { deleteExamTestDTOAdmin } from 'src/@core/dto/examtest.dto';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { ActivityAdminSystemService } from 'src/core-system/activity-admin-system/activity-admin-system.service';

@Injectable()
export class CollaboratorBonusService {
    constructor(

        private globalService: GlobalService,
        private customExceptionService: CustomExceptionService,
        private activityAdminSystemService: ActivityAdminSystemService,
        @InjectModel(CollaboratorBonus.name) private collaboratorBonusModel: Model<CollaboratorBonusDocument>,

    ) { }

    async getList(lang, iPage: iPageDTO) {
        try {
            const query = {
                $and: [{ is_delete: false }]
            }
            const arrItem = await this.collaboratorBonusModel.find(query)
                .populate({ path: 'id_optional_service' })
                .populate({ path: 'id_extend_optional' })
                .sort({ question: 1, date_create: -1 })
                .skip(iPage.start)
                .limit(iPage.length).then();
            const count = await this.collaboratorBonusModel.count(query)
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

    async getDetailCollaboratorBonnus(id) {
        try {
            const getDetailQuestion = await this.collaboratorBonusModel.findById(id)
            return getDetailQuestion;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async createCollaboratorBonus(lang, payload: createCollaboratorBonusDTOAdmin, idAdmin: string) {
        try {
            const newItem = new this.collaboratorBonusModel({
                title: payload.title,
                description: payload.description,
                id_optional_service: payload.id_optional_service,
                id_extend_optional: payload.id_extend_optional,
                is_bonus_area: payload.is_bonus_area,
                bonus_area: payload.bonus_area,
                is_bonus_rush_day: payload.is_bonus_rush_day,
                bonus_rush_day: payload.bonus_rush_day,
                is_bonus_holiday: payload.is_bonus_holiday,
                bonus_holiday: payload.bonus_holiday,
                is_bonus_order_hot: payload.is_bonus_order_hot,
                bonus_order_hot: payload.bonus_order_hot,
                date_create: new Date(Date.now()).toISOString(),
            });
            await newItem.save();
            await this.activityAdminSystemService.createCollaboratorBonus(idAdmin, newItem._id);
            return newItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async editCollaboratorBonus(lang, payload: editCollaboratorBonusDTOAdmin, id: string, idAdmin: string) {
        try {
            const getItem = await this.collaboratorBonusModel.findById(id);
            if (!getItem) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            }
            getItem.title = payload.title || getItem.title
            getItem.description = payload.description || getItem.description
            getItem.id_optional_service = payload.id_optional_service || getItem.id_optional_service
            getItem.id_extend_optional = payload.id_extend_optional || getItem.id_extend_optional

            getItem.is_bonus_area = (payload.is_bonus_area === false && getItem.is_bonus_area) ? false : payload.is_bonus_area
            getItem.bonus_area = payload.bonus_area || getItem.bonus_area

            getItem.is_bonus_rush_day = (payload.is_bonus_rush_day === false && getItem.is_bonus_rush_day) ? false : payload.is_bonus_rush_day
            getItem.bonus_rush_day = payload.bonus_rush_day || getItem.bonus_rush_day

            getItem.is_bonus_holiday = (payload.is_bonus_holiday === false && getItem.is_bonus_holiday) ? false : payload.is_bonus_holiday
            getItem.bonus_holiday = payload.bonus_holiday || getItem.bonus_holiday

            getItem.is_bonus_order_hot = (payload.is_bonus_order_hot === false && getItem.is_bonus_order_hot) ? false : payload.is_bonus_order_hot
            getItem.bonus_order_hot = payload.bonus_order_hot || getItem.bonus_order_hot

            await getItem.save();
            this.activityAdminSystemService.editCollaboratorBonus(idAdmin, id);
            return getItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async actiCollaboratorBonus(lang, payload: actiCollaboratorBonusDTOAdmin, id: string, idAdmin: string) {
        try {
            const getItem = await this.collaboratorBonusModel.findById(id);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            getItem.is_active = (payload.is_active !== getItem.is_active) ? payload.is_active : getItem.is_active
            await getItem.save();
            await this.activityAdminSystemService.activeCollaboratorBonus(idAdmin, id);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async deleteCollaboratorBonus(lang, payload: deleteExamTestDTOAdmin, id: string, idAdmin: string) {
        try {
            const getItem = await this.collaboratorBonusModel.findById(id);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            getItem.is_delete = (payload.is_delete !== getItem.is_delete) ? payload.is_delete : getItem.is_delete
            await getItem.save();
            await this.activityAdminSystemService.deleteCollaboratorBonus(idAdmin, id);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

}
