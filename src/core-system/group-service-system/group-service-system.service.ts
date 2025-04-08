import { Injectable } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common/enums';
import { HttpException } from '@nestjs/common/exceptions';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ERROR, GlobalService, GroupService, GroupServiceDocument, Service, ServiceDocument, activeGroupServiceDTOAdmin, iPageDTO } from 'src/@core';
import { ServiceSystemService } from '../service-system/service-system.service';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';

@Injectable()
export class GroupServiceSystemService {

    constructor(
        private globalService: GlobalService,
        private serviceSystemService: ServiceSystemService,
        private customExceptionService: CustomExceptionService,
        // private i18n: I18nContext,
        @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
        @InjectModel(GroupService.name) private groupServiceModel: Model<GroupServiceDocument>,
    ) { }

    async getListItemHome(lang, iPage: iPageDTO) {
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
                    is_active: true
                }
                ]
            }
            const arrItem = await this.groupServiceModel.find(query)
                .skip(iPage.start)
                .limit(iPage.length).then();
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
                    is_active: true
                },
                {
                    $or: [
                        { is_delete: false },
                        { is_delete: { $exists: false } }
                    ]
                }
                ]
            }
            const arrItem = await this.groupServiceModel.find(query)
                .skip(iPage.start)
                .limit(iPage.length).then();
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

    async activeItem(lang, payload: activeGroupServiceDTOAdmin, id: string, idAdmin: string) {
        try {
            const getItem = await this.groupServiceModel.findById(id);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            getItem.is_active = (payload.is_active != getItem.is_active) ? payload.is_active : getItem.is_active
            await getItem.save();
            if (getItem.is_active === false) {
                const arrService = await this.serviceModel.find({ id_group_service: getItem._id })
                for (let item of arrService) {
                    await this.serviceSystemService.activeItem(lang, payload, item._id, idAdmin)
                }
            }
            return getItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async deleteItem(lang, id: string, idAdmin: string) {
        try {
            const getItem = await this.groupServiceModel.findById(id);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            getItem.is_delete = true;
            await getItem.save();
            const arrService = await this.serviceModel.find({ id_group_service: getItem._id })
            for (let item of arrService) {
                await this.serviceSystemService.deleteItem(lang, item._id, idAdmin)
            }
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
