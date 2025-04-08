import { Injectable } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common/enums';
import { HttpException } from '@nestjs/common/exceptions';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { activeGroupServiceDTOAdmin, ERROR, GlobalService, iPageDTO, OptionalService, OptionalServiceDocument, ServiceDocument } from 'src/@core';
import { GroupOrderDocument } from 'src/@core/db/schema/group_order.schema';
import { GroupOrder } from '../../@core/db/schema/group_order.schema';
import { Service } from '../../@core/db/schema/service.schema';
import { OptionalServiceSystemService } from '../optional-service-system/optional-service-system.service';
import { GroupServiceSystemService } from '../group-service-system/group-service-system.service';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';

@Injectable()
export class ServiceSystemService {
    constructor(
        private globalService: GlobalService,
        // private groupServiceService: GroupServiceSystemService,
        private optionalService: OptionalServiceSystemService,
        private customExceptionService: CustomExceptionService,
        // private groupOrderServiceeee: GroupOrderService,
        // private i18n: I18nContext,
        @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
        @InjectModel(GroupOrder.name) private groupOrderModel: Model<GroupOrderDocument>,
        @InjectModel(OptionalService.name) private optionalServiceModel: Model<OptionalServiceDocument>,
    ) { }

    async getServiceByGroup(lang, iPage: iPageDTO, id: string) {
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
                },
                {
                    id_group_service: id
                }
                ]
            }
            const arrItem = await this.serviceModel.find(query)
                .skip(iPage.start)
                .limit(iPage.length).then();
            const count = await this.serviceModel.count(query)
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

    async getDetailService(lang, id: string) {
        try {
            const findItem = await this.serviceModel.findById(id);
            if (!findItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            return findItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getSerivceOrder(lang) {
        try {
            const SerivceOrder = await this.serviceModel.find();
            if (!SerivceOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            return SerivceOrder;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async activeItem(lang, payload: activeGroupServiceDTOAdmin, id: string, idAdmin: string) {
        try {
            const getItem = await this.serviceModel.findById(id);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            getItem.is_active = (payload.is_active != getItem.is_active) ? payload.is_active : getItem.is_active
            await getItem.save();
            if (getItem.is_active === false) {
                const arrOptionalService = await this.optionalServiceModel.find({ id_service: getItem._id })
                for (let item of arrOptionalService) {
                    await this.optionalService.activeItem(lang, payload, item._id, idAdmin)
                }
            }
            return getItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async deleteItem(lang, id: string, idAdmin: string) {
        try {
            const getItem = await this.serviceModel.findById(id);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            getItem.is_delete = true;
            await getItem.save();
            const arrOptionalService = await this.optionalServiceModel.find({ id_service: getItem._id })
            for (let item of arrOptionalService) {
                await this.optionalService.deleteItem(lang, item._id, idAdmin)
            }
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
