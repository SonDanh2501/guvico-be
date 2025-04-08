import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { createExtendOptionalDTOAdmin, ERROR, GlobalService, iPageDTO, activeExtendOptionalServiceDTOAdmin, editExtendOptionalDTOAdmin } from 'src/@core';
import { ExtendOptional, ExtendOptionalDocument } from 'src/@core/db/schema/extend_optional.schema';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { ActivityAdminSystemService } from 'src/core-system/activity-admin-system/activity-admin-system.service';

@Injectable()
export class ExtendOptionalManagerService {
    constructor(
        private globalService: GlobalService,
        private activityAdminSystemService: ActivityAdminSystemService,
        private customExceptionService: CustomExceptionService,
        // private i18n: I18nContext,
        @InjectModel(ExtendOptional.name) private extendOptionalServiceModel: Model<ExtendOptionalDocument>,

    ) { }


    async getListItem(lang, iPage: iPageDTO) {
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
                    $or: [
                        { is_delete: false },
                        { is_delete: { $exists: false } }
                    ]
                }
                ]
            }
            const arrItem = await this.extendOptionalServiceModel.find(query)
                .skip(iPage.start)
                .limit(iPage.length).then();
            const count = await this.extendOptionalServiceModel.count(query)
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

    async getListExtendOptionalByOptionalService(lang, iPage: iPageDTO, id) {
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
                { id_optional_service: id },
                {
                    $or: [
                        { is_delete: false },
                        { is_delete: { $exists: false } }
                    ]
                }
                ]
            }
            const arrItem = await this.extendOptionalServiceModel.find(query)
                .skip(iPage.start)
                .limit(iPage.length).then();
            const count = await this.extendOptionalServiceModel.count(query)
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
            const findItem = await this.extendOptionalServiceModel.findById(id);
            if (!findItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            return findItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);

        }
    }

    async createItem(lang, payload: createExtendOptionalDTOAdmin, idAdmin: string) {
        try {
            const newItem = new this.extendOptionalServiceModel({
                title: payload.title,
                description: payload.description,
                is_active: payload.is_active,
                thumbnail: payload.thumbnail || '',
                thumbnail_active: payload.thumbnail_active || '',
                id_optional_service: payload.id_optional_service,
                price: payload.price,
                count: payload.count,
                estimate: payload.estimate,
                note: payload.note,
                status_default: payload.status_default || false,
                position: payload.position,
                checked: payload.checked,
                is_show_in_app: payload.is_show_in_app ? payload.is_show_in_app : false,
                is_platform_fee: payload.is_platform_fee ? payload.is_platform_fee : false,
                platform_fee: payload.platform_fee ? payload.platform_fee : 0,
                personal: payload.persional,
                is_price_option_area: payload.is_price_option_area,
                price_option_area: payload.price_option_area,
                is_price_option_rush_day: payload.is_price_option_rush_day,
                price_option_rush_day: payload.price_option_rush_day,
                is_price_option_rush_hour: payload.is_price_option_rush_hour,
                price_option_rush_hour: payload.price_option_rush_hour,
                is_price_option_holiday: payload.is_price_option_holiday,
                price_option_holiday: payload.price_option_holiday,
                kind: payload.kind,
                area_fee: payload.area_fee
            });
            await newItem.save();
            await this.activityAdminSystemService.createExtendOptional(idAdmin, newItem._id);
            return newItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async editItem(lang, payload: editExtendOptionalDTOAdmin, id: string, idAdmin: string) {
        try {
            const getItem = await this.extendOptionalServiceModel.findById(id);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            getItem.title = payload.title || getItem.title
            getItem.description = payload.description || getItem.description
            getItem.thumbnail = payload.thumbnail || getItem.thumbnail
            getItem.thumbnail_active = payload.thumbnail_active || getItem.thumbnail_active
            getItem.id_optional_service = payload.id_optional_service || getItem.id_optional_service
            getItem.price = payload.price || getItem.price
            getItem.count = payload.count || getItem.count
            getItem.estimate = payload.estimate || getItem.estimate
            getItem.note = payload.note || getItem.note
            getItem.status_default = (payload.status_default !== getItem.status_default) ? payload.status_default : getItem.status_default
            getItem.checked = (payload.checked !== getItem.checked) ? payload.checked : getItem.checked
            getItem.position = (payload.position) ? payload.position : getItem.position
            // getItem.is_show_in_app = (payload.is_show_in_app) ? payload.is_show_in_app : getItem.is_show_in_app;
            getItem.is_show_in_app = (payload.is_show_in_app === true && getItem.is_show_in_app) ? getItem.is_show_in_app : payload.is_show_in_app
            getItem.is_price_option_area = (payload.is_price_option_area !== getItem.is_price_option_area) ? payload.is_price_option_area : getItem.is_price_option_area;
            getItem.price_option_area = (payload.price_option_area) ? payload.price_option_area : getItem.price_option_area;
            getItem.kind = (payload.kind) ? payload.kind : getItem.kind;
            getItem.is_price_option_holiday = (payload.is_price_option_holiday !== getItem.is_price_option_holiday) ? payload.is_price_option_holiday : getItem.is_price_option_holiday;
            getItem.price_option_holiday = (payload.price_option_holiday) ? payload.price_option_holiday : getItem.price_option_holiday;

            getItem.is_price_option_rush_day = (payload.is_price_option_rush_day !== getItem.is_price_option_rush_day) ? payload.is_price_option_rush_day : payload.is_price_option_rush_day;
            getItem.price_option_rush_day = (payload.price_option_rush_day) ? payload.price_option_rush_day : getItem.price_option_rush_day;

            // getItem.is_price_option_rush_hour = (payload.is_price_option_rush_hour) ? payload.is_price_option_rush_hour : getItem.is_price_option_rush_hour;
            // getItem.price_option_rush_hour = (payload.price_option_rush_hour) ? payload.price_option_rush_hour : getItem.price_option_rush_hour;

            getItem.area_fee = payload.area_fee || getItem.area_fee

            await getItem.save();
            await this.activityAdminSystemService.editExtendOptional(idAdmin, getItem._id);
            return getItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async activeItem(lang, payload: activeExtendOptionalServiceDTOAdmin, id: string, idAdmin: string) {
        try {
            const getItem = await this.extendOptionalServiceModel.findById(id);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            getItem.is_active = (payload.is_active !== getItem.is_active) ? payload.is_active : getItem.is_active
            await getItem.save();
            await this.activityAdminSystemService.actiExtendOptional(idAdmin, getItem._id);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async deleteItem(lang, id: string, idAdmin: string) {
        try {
            const getItem = await this.extendOptionalServiceModel.findById(id);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            getItem.is_delete = true;
            await getItem.save();
            await this.activityAdminSystemService.deleteExtendOptional(idAdmin, getItem._id);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
