import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ERROR, UserSystemDocument, iPageDTO } from 'src/@core';
import { Business, BusinessDocument } from 'src/@core/db/schema/business.schema';
import { actiBusinessDTOAdmin, createBusinessDTOAdmin, editBusinessDTOAdmin } from 'src/@core/dto/business.dto';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { ActivityAdminSystemService } from 'src/core-system/activity-admin-system/activity-admin-system.service';

@Injectable()
export class BusinessManagerService {
    constructor(
        private activityAdminSystemService: ActivityAdminSystemService,
        private customExceptionService: CustomExceptionService,
        @InjectModel(Business.name) private businessModel: Model<BusinessDocument>,
    ) { }

    async getListItem(lang, iPage: iPageDTO) {
        try {
            const query = {
                $and: [
                    {
                        $or: [
                            {
                                full_name: {
                                    $regex: iPage.search,
                                    $options: "i"
                                }
                            },
                            {
                                tax_code: {
                                    $regex: iPage.search,
                                    $options: "i"
                                }
                            },
                        ]
                    },
                    {
                        is_delete: false,
                    }
                ]
            }
            const arrItem = await this.businessModel.find(query)
                .sort({ date_create: -1 })
                .skip(iPage.start)
                .limit(iPage.length)

            const count = await this.businessModel.count(query)
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
            const getItem = await this.businessModel.findById(id);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND)
            return getItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    async createItem(lang, payload: createBusinessDTOAdmin, admin: UserSystemDocument) {
        try {
            const newItem = new this.businessModel({
                type_permisstion: payload.type_permisstion,
                full_name: payload.full_name,
                avatar: payload.avatar,
                tax_code: payload.tax_code,
                date_create: new Date(Date.now()).toISOString(),
                area_manager_lv_0: 'viet_nam',
                area_manager_lv_1: payload.area_manager_lv_1,
                area_manager_lv_2: payload.area_manager_lv_2,
                id_service_manager: payload.id_service_manager,
            });
            await newItem.save();
            this.activityAdminSystemService.createBusiness(admin._id, newItem._id);
            return newItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async editItem(lang, payload: editBusinessDTOAdmin, id: string, admin: UserSystemDocument) {
        try {
            const getItem = await this.businessModel.findById(id);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            getItem.full_name = payload.full_name || getItem.full_name;
            getItem.avatar = payload.avatar || getItem.avatar;
            getItem.type_permisstion = payload.type_permisstion || getItem.type_permisstion;
            getItem.tax_code = payload.tax_code || getItem.tax_code;
            getItem.area_manager_lv_0 = payload.area_manager_lv_0 || getItem.area_manager_lv_0;
            getItem.area_manager_lv_1 = payload.area_manager_lv_1 || getItem.area_manager_lv_1;
            getItem.area_manager_lv_2 = payload.area_manager_lv_2 || getItem.area_manager_lv_2;
            getItem.id_service_manager = payload.id_service_manager || getItem.id_service_manager;
            await getItem.save();
            this.activityAdminSystemService.editBusiness(admin._id, getItem._id);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async actiItem(lang, payload: actiBusinessDTOAdmin, id: string, admin: UserSystemDocument) {
        try {
            const getItem = await this.businessModel.findById(id);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            getItem.is_active = (payload.is_active !== getItem.is_active) ? payload.is_active : getItem.is_active
            await getItem.save();
            this.activityAdminSystemService.activeBusiness(admin._id, getItem._id);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async deleteItem(lang, id: string, admin: UserSystemDocument) {
        try {
            const getItem = await this.businessModel.findById(id);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            getItem.is_delete = true;
            await getItem.save();
            this.activityAdminSystemService.deleteBusiness(admin._id, getItem._id);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
