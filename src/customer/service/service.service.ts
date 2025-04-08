import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ERROR, GlobalService, getFieldsServiceCustomerDTO, iPageDTO } from 'src/@core';
import { Service, ServiceDocument } from 'src/@core/db/schema/service.schema';
import { GroupOrder, GroupOrderDocument } from 'src/@core/db/schema/group_order.schema';
import { GroupServiceService } from '../group-service/group-service.service';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service';
// import { GroupOrderService } from '../group-order/group-order.service';

@Injectable()
export class ServiceService {
    constructor(
        private globalService: GlobalService,
        private groupServiceService: GroupServiceService,
        private customExceptionService: CustomExceptionService,
        private generalHandleService: GeneralHandleService,
        
        // private groupOrderServiceeee: GroupOrderService,
        // private i18n: I18nContext,
        @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
        @InjectModel(GroupOrder.name) private groupOrderModel: Model<GroupOrderDocument>,
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

    // async getLastestService(lang, iPage, user) {
    //     try {
    //         const getLastItem = await this.groupOrderServiceeee.getLastItem(lang)
    //         return getLastItem
    //         // const groupService = await this.groupServiceService.getListItem(lang, iPage)
    //         // return groupService
    //         // const query = {
    //         //     $and: [{
    //         //         $or: [{
    //         //             name: {
    //         //                 $regex: iPage.search,
    //         //                 $options: "i"
    //         //             },
    //         //         },]
    //         //     },
    //         //     {
    //         //         is_active: true
    //         //     },
    //         //     {
    //         //         $or: [
    //         //             { is_delete: false },
    //         //             { is_delete: { $exists: false } }
    //         //         ]
    //         //     },
    //         //     {
    //         //         id_group_service: 
    //         //     }
    //         //     ]
    //         // }
    //         // const arrItem = await this.serviceModel.find(query)
    //         //     .skip(iPage.start)
    //         //     .limit(iPage.length).then();
    //         // const count = await this.serviceModel.count(query)
    //         // const result = {
    //         //     start: iPage.start,
    //         //     length: iPage.length,
    //         //     totalItem: count,
    //         //     data: arrItem
    //         // }
    //         // return result;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }


    async getFieldsService(lang, id: string, query: getFieldsServiceCustomerDTO) {
        try {
            const findItem = await this.serviceModel.findById(id).select({minimum_time_order: 1});
            if (!findItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            // const getCodeAdministrative = await this.generalHandleService.getCodeAdministrativeToString(query.address);
            // if(findItem.minimum_time_order.findIndex((x: any) => getCodeAdministrative.city === x.area_lv_1) > -1 && findItem.minimum_time_order.findIndex((x: any) => getCodeAdministrative.district === x.area_lv_2) > -1) {
                
            // }
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


    async getDetailService(lang, id: string) {
        try {
            const findItem = await this.serviceModel.findById(id)
            if (!findItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            return findItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);

        }
    }
    


}
