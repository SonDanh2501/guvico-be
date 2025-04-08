import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { createPopupDTOAdmin, iPagePopupDTOAdmin } from 'src/@core/dto/popup.dto';
import { InjectModel } from '@nestjs/mongoose';
import { UserSystem, UserSystemDocument } from '../../../@core/db/schema/user_system.schema';
import { Model } from 'mongoose';
import { CustomExceptionService } from '../../../@share-module/custom-exception/custom-exception.service';
import { ERROR } from '../../../@core/constant/i18n.field';
import { Popup, PopupDocument } from '../../../@core/db/schema/popup.schema';
import { ActivityAdminSystemService } from '../../../core-system/activity-admin-system/activity-admin-system.service';
import { UserSystemRepositoryService } from 'src/@repositories/repository-service/user-system-repository/user-system-repository.service';

@Injectable()
export class PopupManagerService {
    constructor(
        private customExceptionService: CustomExceptionService,
        private activityAdminSystemService: ActivityAdminSystemService,
        private userSystemRepositoryService: UserSystemRepositoryService,
        @InjectModel(UserSystem.name) private userSystemModel: Model<UserSystemDocument>,
        @InjectModel(Popup.name) private popupModel: Model<PopupDocument>,
    ) { }

    async createItem(lang, payload: createPopupDTOAdmin, idAdmin) {
        try {
            const getAdmin = await this.userSystemRepositoryService.findOneById(idAdmin)
            if (!getAdmin) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, "admin")], HttpStatus.NOT_FOUND);
            if (payload.image === "") {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "image")], HttpStatus.NOT_FOUND);
            }
            const newItem = new this.popupModel({
                image: payload.image,
                is_active: payload.is_active,
                is_delete: false,
                date_create: new Date(Date.now()).toISOString(),
                is_date_schedule: payload.is_date_schedule,
                start_date: (payload.start_date) ? payload.start_date : null,
                end_date: (payload.end_date) ? payload.end_date : null
            });
            await newItem.save();
            this.activityAdminSystemService.createPopup(getAdmin._id, newItem._id)
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async editItem(lang, payload: createPopupDTOAdmin, idPopup, idAdmin) {
        try {
            const getAdmin = await this.userSystemRepositoryService.findOneById(idAdmin)
            if (!getAdmin) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, "admin")], HttpStatus.NOT_FOUND);
            if (payload.image === "") {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "image")], HttpStatus.NOT_FOUND);
            }
            const getPopup = await this.popupModel.findById(idPopup)
            if (!getPopup) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "popup")], HttpStatus.NOT_FOUND);
            getPopup.image = payload.image || getPopup.image;
            getPopup.start_date = payload.start_date || getPopup.start_date;
            getPopup.end_date = payload.end_date || getPopup.end_date;
            getPopup.is_date_schedule = payload.is_date_schedule || getPopup.is_date_schedule;
            await getPopup.save();
            this.activityAdminSystemService.editPopup(getAdmin._id, getPopup._id)

            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async deleteItem(lang, idPopup, idAdmin) {
        try {
            const getAdmin = await this.userSystemRepositoryService.findOneById(idAdmin)
            if (!getAdmin) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, "admin")], HttpStatus.NOT_FOUND);
            const getPopup = await this.popupModel.findById(idPopup)
            if (!getPopup) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "popup")], HttpStatus.NOT_FOUND);
            getPopup.is_delete = true;
            await getPopup.save();
            this.activityAdminSystemService.deletePopup(getAdmin._id, getPopup._id)

            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async activeItem(lang, idPopup, idAdmin) {
        try {
            const getAdmin = await this.userSystemRepositoryService.findOneById(idAdmin);
            if (!getAdmin) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, "admin")], HttpStatus.NOT_FOUND);
            const getPopup = await this.popupModel.findById(idPopup);
            if (!getPopup) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "popup")], HttpStatus.NOT_FOUND);
            getPopup.is_active = (getPopup.is_active) ? false : true;
            await getPopup.save();
            this.activityAdminSystemService.activePopup(getAdmin._id, getPopup._id)

            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async changeStatusItem(lang, idPopup, status, idAdmin) {
        try {
            const getAdmin = await this.userSystemRepositoryService.findOneById(idAdmin);
            if (!getAdmin) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, "admin")], HttpStatus.NOT_FOUND);
            const getPopup = await this.popupModel.findById(idPopup);
            if (!getPopup) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "popup")], HttpStatus.NOT_FOUND);
            getPopup.status = (status) ? status : getPopup.status;
            await getPopup.save();
            this.activityAdminSystemService.changeStatusPopup(getAdmin._id, getPopup._id)
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getList(lang, iPage: iPagePopupDTOAdmin) {
        try {
            let query: any = {
                $and: [
                    { is_delete: false },
                    { is_active: false },
                ]
            }
            if (iPage.status !== "all") {
                query.$and.push({ status: iPage.status })
            }
            const getList = await this.popupModel.find(query)
                .skip(iPage.start)
                .limit(iPage.length)
                .sort({ date_create: -1, _id: -1 });
            return getList;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
