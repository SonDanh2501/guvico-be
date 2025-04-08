import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { createOptionalServiceDTOAdmin, editOptionalServiceDTOAdmin, ERROR, GlobalService, iPageDTO, activeOptionalServiceDTOAdmin } from 'src/@core';
import { OptionalService, OptionalServiceDocument } from 'src/@core/db/schema/optional_service.schema';
import { ActivityAdminSystemService } from 'src/core-system/activity-admin-system/activity-admin-system.service';
import { ExtendOptionalManagerService } from '../extend-optional-manager/extend-optional-manager.service';
import { OptionalServiceSystemService } from 'src/core-system/optional-service-system/optional-service-system.service';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';

@Injectable()
export class OptionalServiceManagerService {
    constructor(
        private globalService: GlobalService,
        private activityAdminSystemService: ActivityAdminSystemService,
        private extendOptionalManagerService: ExtendOptionalManagerService,
        private optionalServiceSystemService: OptionalServiceSystemService,
        private customExceptionService: CustomExceptionService,
        @InjectModel(OptionalService.name) private optionalServiceModel: Model<OptionalServiceDocument>,
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
            const arrItem = await this.optionalServiceModel.find(query)
                .skip(iPage.start)
                .limit(iPage.length).then();
            const count = await this.optionalServiceModel.count(query)
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

    async getListOptionalServiceByService(lang, iPage: iPageDTO, id) {
        try {
            const query = {
                $and: [
                    { id_service: id },
                    { is_delete: false },
                ]
            }
            const arrItem = await this.optionalServiceModel.find(query)
                .skip(iPage.start)
                .limit(iPage.length).then();
            const count = await this.optionalServiceModel.count(query);
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
            const findItem = await this.optionalServiceModel.findById(id);
            if (!findItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            return findItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async createItem(lang, payload: createOptionalServiceDTOAdmin, idAdmin: string) {
        try {
            const newItem = new this.optionalServiceModel({
                title: payload.title,
                thumbnail: payload.thumbnail || 'https://res.cloudinary.com/dcivdqyyj/image/upload/v1678156195/ik1vi5jkrilnxgatpr6h.png',
                description: payload.description,
                id_service: payload.id_service,
                type: payload.type,
                position: payload.position,
                screen: payload.screen,
                platform_fee: payload.platform_fee,
                price_option_holiday: payload.price_option_holiday || [],
                price_option_rush_hour: payload.price_option_rush_hour || [],
                price_option_rush_day: payload.price_option_rush_day || []
            });
            await newItem.save();
            this.activityAdminSystemService.createOptionalService(idAdmin, newItem._id);
            return newItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async editItem(lang, payload: editOptionalServiceDTOAdmin, id: string, idAdmin: string) {
        try {
            const getItem = await this.optionalServiceModel.findById(id);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, 'optional service')], HttpStatus.NOT_FOUND);
            getItem.title = payload.title || getItem.title;
            getItem.thumbnail = payload.thumbnail || getItem.thumbnail;
            getItem.type = payload.type || getItem.type;
            getItem.description = payload.description || getItem.description;
            getItem.id_service = payload.id_service || getItem.id_service;
            getItem.type = payload.type || getItem.type;
            getItem.screen = payload.screen || getItem.screen;
            getItem.position = payload.position || getItem.position;
            getItem.platform_fee = payload.platform_fee || getItem.platform_fee;
            getItem.price_option_holiday = payload.price_option_holiday || getItem.price_option_holiday;
            getItem.price_option_rush_hour = payload.price_option_rush_hour || getItem.price_option_rush_hour;
            getItem.price_option_rush_day = payload.price_option_rush_day || getItem.price_option_rush_day;
            await getItem.save();
            this.activityAdminSystemService.editOptionalService(idAdmin, getItem._id);
            return getItem;

        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async activeItem(lang, payload: activeOptionalServiceDTOAdmin, id: string, idAdmin: string) {
        try {
            await this.optionalServiceSystemService.activeItem(lang, payload, id, idAdmin)
            await this.activityAdminSystemService.actiOptionalService(idAdmin, id);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async deleteItem(lang, id: string, idAdmin: string) {
        try {
            await this.optionalServiceSystemService.deleteItem(lang, id, idAdmin)
            await this.activityAdminSystemService.deleteOptionalService(idAdmin, id);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

}
