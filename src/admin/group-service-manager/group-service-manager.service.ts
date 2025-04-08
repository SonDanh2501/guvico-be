import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { createGroupServiceDTOAdmin, ERROR, GlobalService, iPageDTO, editGroupServiceDTOAdmin, activeGroupServiceDTOAdmin, Service, ServiceDocument, OptionalService, OptionalServiceDocument, ExtendOptionalDocument, ExtendOptional } from 'src/@core';
import { GroupService, GroupServiceDocument } from 'src/@core/db/schema/group_service.schema';
import { ActivityAdminSystemService } from 'src/core-system/activity-admin-system/activity-admin-system.service';
import { ServiceManagerService } from '../service-manager/service-manager.service';
import { GroupServiceSystemService } from 'src/core-system/group-service-system/group-service-system.service';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
@Injectable()
export class GroupServiceManagerService {
    constructor(
        private globalService: GlobalService,
        private activityAdminSystemService: ActivityAdminSystemService,
        private serviceManagerService: ServiceManagerService,
        private groupServiceSystemService: GroupServiceSystemService,
        private customExceptionService: CustomExceptionService,
        // private i18n: I18nContext,
        @InjectModel(GroupService.name) private groupServiceModel: Model<GroupServiceDocument>,
        @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
        @InjectModel(OptionalService.name) private optionalServiceModel: Model<OptionalServiceDocument>,
        @InjectModel(ExtendOptional.name) private extendOptionalServiceModel: Model<ExtendOptionalDocument>,
    ) { }


    async getListItem(lang, iPage: iPageDTO) {
        try {
            const query = {
                $and: [
                    { is_delete: false },
                ]
            }
            const arrItem = await this.groupServiceModel.find(query)
                .sort({ position: 1 })
                .skip(iPage.start)
                .limit(iPage.length)
            const count = await this.groupServiceModel.count(query)
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
            const findItem = await this.groupServiceModel.findById(id);
            if (!findItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            return findItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);

        }
    }

    async createItem(lang, payload: createGroupServiceDTOAdmin, idAdmin: string) {
        try {
            const newCustomer = new this.groupServiceModel({
                title: payload.title,
                thumbnail: payload.thumbnail || "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Windows_Settings_app_icon.png/768px-Windows_Settings_app_icon.png",
                description: payload.description || { en: "", vi: "" },
                type: payload.type || "single",
                point_popular: 0,
                kind: payload.kind ? payload.kind : '',
                position: payload.position || 0
            });
            await newCustomer.save();
            await this.activityAdminSystemService.createGroupService(idAdmin, newCustomer._id);
            return newCustomer;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async editItem(lang, payload: editGroupServiceDTOAdmin, id: string, idAdmin: string) {
        try {
            const getItem = await this.groupServiceModel.findById(id);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            getItem.title = payload.title || getItem.title;
            getItem.description = payload.description || getItem.description;
            getItem.thumbnail = payload.thumbnail || getItem.thumbnail;
            getItem.type = payload.type || getItem.type;
            getItem.kind = payload.kind || getItem.kind;
            getItem.position = payload.position;
            await getItem.save();
            await this.activityAdminSystemService.editGroupService(idAdmin, getItem._id);
            return getItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async activeItem(lang, payload: activeGroupServiceDTOAdmin, id: string, idAdmin: string) {
        try {
            await this.groupServiceSystemService.activeItem(lang, payload, id, idAdmin)
            await this.activityAdminSystemService.actiGroupService(idAdmin, id);
            return true
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async deleteItem(lang, id: string, idAdmin: string) {
        try {
            await this.groupServiceSystemService.deleteItem(lang, id, idAdmin)
            await this.activityAdminSystemService.deleteGroupService(idAdmin, id);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
