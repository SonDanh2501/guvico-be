import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { ERROR, iPageDTO, iPageHistoryOrderDTOCollaborator, iPageOrderNearDTOCollaborator, iPageOrderScheduleWorkDTOCollaborator, Order, OrderDocument, POPULATE_ID_CUSTOMER, POPULATE_ID_GROUP_ORDER, TOTAL_ORDER } from 'src/@core'
import { Collaborator, CollaboratorDocument } from 'src/@core/db/schema/collaborator.schema'
import { CollaboratorSetting, CollaboratorSettingDocument } from 'src/@core/db/schema/collaborator_setting.schema'
import { ReasonCancel, ReasonCancelDocument } from 'src/@core/db/schema/reason_cancel.schema'
import { CollaboratorRepositoryService } from 'src/@repositories/repository-service/collaborator-repository/collaborator-repository.service'
import { CustomerRepositoryService } from 'src/@repositories/repository-service/customer-repository/customer-repository.service'
import { OrderRepositoryService } from 'src/@repositories/repository-service/order-repository/order-repository.service'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
import { CoreSystemService } from 'src/core-system/@core-system/core-system.service'
import { OrderSystemService2 } from 'src/core-system/@core-system/order-system/order-system.service'
import { CollaboratorSystemService } from 'src/core-system/collaborator-system/collaborator-system.service'
import { GroupOrderSystemService } from 'src/core-system/group-order-system/group-order-system.service'
import { OrderSystemService } from 'src/core-system/order-system/order-system.service'

@Injectable()
export class JobService {
    constructor(
        private customExceptionService: CustomExceptionService,
        private orderSystemService: OrderSystemService,
        private groupOrderSystemService: GroupOrderSystemService,
        private collaboratorRepositoryService: CollaboratorRepositoryService,
        private collaboratorSystemService: CollaboratorSystemService,
        private orderRepositoryService: OrderRepositoryService,
        private customerRepositoryService: CustomerRepositoryService,

        private coreSystemService: CoreSystemService,
        private orderSystemService2: OrderSystemService2,

        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @InjectModel(Collaborator.name) private collaboratorModel: Model<CollaboratorDocument>,
        @InjectModel(ReasonCancel.name) private reasonCancelModel: Model<ReasonCancelDocument>,
        @InjectModel(CollaboratorSetting.name) private collaboratorSettingModel: Model<CollaboratorSettingDocument>,

    ) { }
    // chuẩn bị loại bỏ (note 06-11-2023)
    // async getOrderFavouriteV2(lang, iPage: iPageDTO, idUser) {
    //     try {
    //         const getCollaborator = await this.collaboratorModel.findById(idUser);
    //         const query = {
    //             $and: [
    //                 {
    //                     $or: [{
    //                         name_customer: {
    //                             $regex: iPage.search,
    //                             $options: "i"
    //                         },
    //                     },]
    //                 },
    //                 {
    //                     $or: [
    //                         { id_cancel_collaborator: [] },
    //                         {
    //                             $and: [
    //                                 { "id_cancel_collaborator.id_collaborator": { $exists: true } },
    //                                 { id_cancel_collaborator: { $not: { $elemMatch: { id_collaborator: idUser } } } }
    //                             ]
    //                         }
    //                     ]
    //                 },
    //                 { id_collaborator: null },
    //                 { status: 'pending' },
    //                 { is_delete: false },
    //                 {
    //                     $or: [
    //                         { is_duplicate: false },
    //                     ]
    //                 },
    //                 // {
    //                 //     city: getCollaborator.city
    //                 // },
    //                 {
    //                     id_favourite_collaborator: getCollaborator._id
    //                 },
    //                 {
    //                     $or: [
    //                         { id_block_collaborator: [] },
    //                         {
    //                             $and: [
    //                                 { id_block_collaborator: { $ne: getCollaborator._id } }
    //                             ]
    //                         }
    //                     ]
    //                 },
    //                 {
    //                     'service._id': { $in: getCollaborator.service_apply }
    //                 }
    //             ]
    //         }
    //         const count = await this.orderModel.count(query);
    //         const getOrder = await this.orderModel.find(query)
    //             .sort({ date_work: 1, _id: 1 })
    //             .skip(iPage.start)
    //             .limit(iPage.length)
    //             .populate({ path: 'service._id', select: { title: 1 } })
    //             .populate({ path: 'id_customer', select: { avatar: 1, full_name: 1, name: 1, code_phone_area: 1, phone: 1, gender: 1 } })
    //             .populate({ path: 'service.optional_service._id', select: { position: 1, screen: 1, type: 1, title: 1 } })
    //             .populate({
    //                 path: 'id_group_order', select: {
    //                     date_work_schedule: 1, type: 1, time_schedule: 1, is_auto_order: 1,
    //                     temp_final_fee: 1, temp_initial_fee: 1, temp_net_income_collaborator: 1, temp_pending_money: 1, temp_refund_money: 1, temp_platform_fee: 1,
    //                     final_fee: 1, initial_fee: 1, net_income_collaborator: 1, pending_money: 1, refund_money: 1, platform_fee: 1
    //                 }
    //             });

    //         const result = {
    //             start: iPage.start,
    //             length: iPage.length,
    //             totalItem: count,
    //             data: getOrder
    //         }
    //         return result;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }

    async getOrderFavouriteV3(lang, iPage: iPageDTO, idUser) {
        try {
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(idUser);

            const currentDate = new Date(Date.now());
            const getCollaboratorSetting = await this.collaboratorSettingModel.findOne();
            const timePushNoti = getCollaboratorSetting.time_push_noti_collaborator ? getCollaboratorSetting.time_push_noti_collaborator : 3;
            let query: any = {
                $and: [
                    {
                        id_collaborator: null
                    },
                    {
                        status: "pending"
                    },
                    {
                        $or: [
                            { id_cancel_collaborator: [] },
                            {
                                $and: [
                                    { id_cancel_collaborator: { $gt: { $size: 0 } } },
                                    { temp: { $ne: getCollaborator._id } }
                                ]

                            }
                        ]
                    },
                    {
                        $or: [
                            { id_block_collaborator: [] },
                            {
                                $and: [
                                    { id_block_collaborator: { $ne: getCollaborator._id } }
                                ]
                            }
                        ]
                    },
                    {
                        city: getCollaborator.city
                    },
                    {
                        district: { $in: getCollaborator.district }
                    },
                    { is_duplicate: false },
                    {
                        $or: [
                            {
                                $and: [
                                    {
                                        $expr: {
                                            $gt:
                                                ["$timeDifferent", timePushNoti]
                                        }
                                    },
                                    { id_favourite_collaborator: { $ne: [] } },
                                    // { id_favourite_collaborator: getCollaborator._id },
                                ]
                            },
                            {
                                id_favourite_collaborator: getCollaborator._id
                            },
                            {
                                id_favourite_collaborator: []
                            },

                        ]
                    },
                    {
                        'service._id': { $in: getCollaborator.service_apply }
                    }
                ]
            }
            const getOrder = await this.orderModel.aggregate([
                {
                    $addFields: {
                        is_favourite: { $in: [getCollaborator._id, '$id_favourite_collaborator'] }
                    }
                },
                {
                    $addFields: {
                        temp: {
                            $concatArrays: [
                                "$id_cancel_collaborator.id_collaborator",// nối tất cả các ID của các CTV đã hủy việc lại để dùng cho việc query $ne [id CTV hủy việ]
                            ],
                        },
                    },
                },
                {
                    $addFields: { //convert field ngày tạo thành 1 giá trị thời gian (giá trị trước đó là string)
                        startDate: {
                            $dateFromString: {
                                dateString: "$date_create"
                            }
                        }
                    }
                },
                {
                    $addFields: {
                        timeDifferent: // so sánh thời gian hiện tại với thời gian cv được tạo ra => tạo ra 1 giá trị kiểu số
                        {
                            $dateDiff:
                            {
                                startDate: "$startDate",
                                endDate: currentDate,
                                unit: "minute"
                            }
                        },
                    },
                },
                {
                    $match: query
                },
                {
                    $sort: { date_work: 1, _id: 1 }
                },
                {
                    $skip: iPage.start
                },
                {
                    $limit: iPage.length
                },
                {
                    $lookup: {
                        from: "services",
                        localField: "service._id",
                        foreignField: "_id",
                        as: "servicePop"
                    }
                },
                {
                    $lookup: {
                        from: "customers",
                        localField: "id_customer",
                        foreignField: "_id",
                        as: "id_customer"
                    }
                },
                {
                    $lookup: {
                        from: "grouporders",
                        localField: "id_group_order",
                        foreignField: "_id",
                        as: "id_group_order"
                    }
                },
                { $unwind: "$servicePop" },
                { $unwind: "$id_customer" },
                { $unwind: "$id_group_order" },
                {
                    $addFields: {
                        service: {
                            "_id": {
                                "_id": "$servicePop._id",
                                "title": "$servicePop.title"
                            },
                            "optional_service": "$service.optional_service"
                        }
                    }
                },
                {
                    $project: {
                        servicePop: 0,
                        id_customer: POPULATE_ID_CUSTOMER,
                        id_group_order: POPULATE_ID_GROUP_ORDER
                    }
                },
            ])
            const count = await this.orderModel.aggregate([
                {
                    $addFields: {
                        temp: {
                            $concatArrays: [
                                "$id_cancel_collaborator.id_collaborator",
                            ],
                        },
                    },
                },
                {
                    $addFields: {
                        startDate: {
                            $dateFromString: {
                                dateString: "$date_create"
                            }
                        }
                    }
                },
                {
                    $addFields: {
                        timeDifferent:
                        {
                            $dateDiff:
                            {
                                startDate: "$startDate",
                                endDate: currentDate,
                                unit: "minute"
                            }
                        },
                    },
                },
                {
                    $match: query
                },
                { $count: 'total' }
            ])
            const result = {
                start: iPage.start,
                length: iPage.length,
                totalItem: count.length > 0 ? count[0].total : 0,
                data: getOrder
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getOrderCityV2(lang, iPage: iPageDTO, idUser) {
        try {
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(idUser);


            const currentDate = new Date(Date.now());
            const getCollaboratorSetting = await this.collaboratorSettingModel.findOne()
            const timePushNoti = getCollaboratorSetting.time_push_noti_collaborator ? getCollaboratorSetting.time_push_noti_collaborator : 3;
            let query: any = {
                $and: [
                    // {
                    //     $or: [{
                    //         name_customer: {
                    //             $regex: iPage.search,
                    //             $options: "i"
                    //         },
                    //     },
                    //     {
                    //         phone_customer: {
                    //             $regex: iPage.search,
                    //             $options: "i"
                    //         },
                    //     },]
                    // },
                    {
                        id_collaborator: null
                    },
                    {
                        status: "pending"
                    },
                    {
                        $or: [
                            { id_cancel_collaborator: [] },
                            {
                                $and: [
                                    { id_cancel_collaborator: { $gt: { $size: 0 } } },
                                    { temp: { $ne: getCollaborator._id } }
                                ]

                            }
                        ]
                    },
                    {
                        $or: [
                            { id_block_collaborator: [] },
                            {
                                $and: [
                                    { id_block_collaborator: { $ne: getCollaborator._id } }
                                ]
                            }
                        ]
                    },
                    { is_duplicate: false },
                    {
                        $or: [
                            {
                                $and: [
                                    {
                                        $expr: {
                                            $gt:
                                                ["$timeDifferent", timePushNoti]
                                        }
                                    },
                                    { id_favourite_collaborator: { $ne: [] } }
                                ]
                            },
                            {
                                id_favourite_collaborator: getCollaborator._id
                            },
                            {
                                id_favourite_collaborator: []
                            },

                        ]
                    },
                    {
                        'service._id': { $in: getCollaborator.service_apply }
                    },
                    {
                        city: getCollaborator.city
                    },
                ]
            }
            if (getCollaborator.city < 0) {
                query.$and.pop()
            }
            if (getCollaborator.id_business) {
                // nếu CTV thuộc doanh nghiệp nào đó thì chỉ có thể thấy cv ở khu mà doanh nghiệp quản lý 
                query.$and.push({
                    $and: [
                        {
                            city: getCollaborator.city
                        },
                        {
                            district: { $in: getCollaborator.district }
                        },
                    ]
                })
            }
            const arrItem = await this.orderModel.aggregate([
                {
                    $addFields: {
                        is_favourite: { $in: [getCollaborator._id, '$id_favourite_collaborator'] }
                    }
                },
                {
                    $addFields: {
                        temp: {
                            $concatArrays: [
                                "$id_cancel_collaborator.id_collaborator",
                            ],
                        },
                    },
                },
                {
                    $addFields: {
                        startDate: {
                            $dateFromString: {
                                dateString: "$date_create"
                            }
                        }
                    }
                },
                {
                    $addFields: {
                        timeDifferent:
                        {
                            $dateDiff:
                            {
                                startDate: "$startDate",
                                endDate: currentDate,
                                unit: "minute"
                            }
                        },
                    },
                },
                {
                    $match: query
                },
                {
                    $sort: { date_work: 1, _id: 1 }
                },
                {
                    $skip: iPage.start
                },
                {
                    $limit: iPage.length
                },
                {
                    $lookup: {
                        from: "services",
                        localField: "service._id",
                        foreignField: "_id",
                        as: "servicePop"
                    }
                },
                {
                    $lookup: {
                        from: "customers",
                        localField: "id_customer",
                        foreignField: "_id",
                        as: "id_customer"
                    }
                },
                {
                    $lookup: {
                        from: "grouporders",
                        localField: "id_group_order",
                        foreignField: "_id",
                        as: "id_group_order"
                    }
                },
                { $unwind: "$servicePop" },
                { $unwind: "$id_customer" },
                { $unwind: "$id_group_order" },
                {
                    $addFields: {
                        service: {
                            "_id": {
                                "_id": "$servicePop._id",
                                "title": "$servicePop.title"
                            },
                            "optional_service": "$service.optional_service"
                        }
                    }
                },
                {
                    $project: {
                        servicePop: 0,
                        id_customer: POPULATE_ID_CUSTOMER,
                        id_group_order: POPULATE_ID_GROUP_ORDER
                    }
                },
            ])
            return {
                start: iPage.start,
                length: iPage.length,
                totalItem: arrItem.length,
                data: arrItem.length > 0 ? arrItem : []
            };
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getOrderNearMeV2(lang, iPage: iPageOrderNearDTOCollaborator, idUser) {
        try {
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(idUser);

            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, 'collaborator')], HttpStatus.NOT_FOUND);
            const getCollaboratorSetting = await this.collaboratorSettingModel.findOne()
            const timePushNoti = getCollaboratorSetting.time_push_noti_collaborator ? getCollaboratorSetting.time_push_noti_collaborator : 3;

            const currentDate = new Date(Date.now());
            let query: any = {
                $and: [
                    // {
                    //     $or: [{
                    //         name_customer: {
                    //             $regex: iPage.search,
                    //             $options: "i"
                    //         },
                    //     },
                    //     {
                    //         phone_customer: {
                    //             $regex: iPage.search,
                    //             $options: "i"
                    //         },
                    //     },]
                    // },
                    {
                        id_collaborator: null
                    },
                    {
                        status: "pending"
                    },
                    {
                        $or: [
                            { id_cancel_collaborator: [] },
                            {
                                $and: [
                                    { id_cancel_collaborator: { $gt: { $size: 0 } } },
                                    { temp: { $ne: getCollaborator._id } }
                                ]

                            }
                        ]
                    },
                    {
                        $or: [
                            { id_block_collaborator: [] },
                            {
                                $and: [
                                    { id_block_collaborator: { $ne: getCollaborator._id } }
                                ]
                            }
                        ]
                    },
                    { is_duplicate: false },
                    {
                        $or: [
                            {
                                $and: [
                                    {
                                        $expr: {
                                            $gt:
                                                ["$timeDifferent", timePushNoti]
                                        }
                                    },
                                    { id_favourite_collaborator: { $ne: [] } }
                                ]
                            },
                            {
                                id_favourite_collaborator: getCollaborator._id
                            },
                            {
                                id_favourite_collaborator: []
                            },

                        ]
                    },
                    {
                        'service._id': { $in: getCollaborator.service_apply }
                    }
                ]
            }
            if (getCollaborator.id_business) {
                // nếu CTV thuộc doanh nghiệp nào đó thì chỉ có thể thấy cv ở khu mà doanh nghiệp quản lý 
                query.$and.push({
                    $and: [
                        {
                            city: getCollaborator.city
                        },
                        {
                            district: { $in: getCollaborator.district }
                        },
                    ]
                })
            }
            const arrItem = await this.orderModel.aggregate([

                {
                    $geoNear: {
                        near: { type: "Point", coordinates: iPage.location },
                        distanceField: "dist.calculated",
                        maxDistance: 10000,
                        spherical: true
                    }
                },
                {
                    $addFields: {
                        is_favourite: { $in: [getCollaborator._id, '$id_favourite_collaborator'] }
                    }
                },
                {
                    $addFields: {
                        startDate: {
                            $dateFromString: {
                                dateString: "$date_create"
                            }
                        }
                    }
                },
                {
                    $addFields: {
                        timeDifferent:
                        {
                            $dateDiff:
                            {
                                startDate: "$startDate",
                                endDate: currentDate,
                                unit: "minute"
                            }
                        },
                    },
                },
                {
                    $addFields: {
                        temp: {
                            $concatArrays: [
                                "$id_cancel_collaborator.id_collaborator",
                            ],
                        },
                    },
                },
                {
                    $match: query
                },
                {
                    $sort: { date_work: 1, _id: 1 }
                },
                {
                    $skip: iPage.start
                },
                {
                    $limit: iPage.length
                },
                {
                    $lookup: {
                        from: "services",
                        localField: "service._id",
                        foreignField: "_id",
                        as: "servicePop"
                    }
                },
                {
                    $lookup: {
                        from: "customers",
                        localField: "id_customer",
                        foreignField: "_id",
                        as: "id_customer"
                    }
                },
                {
                    $lookup: {
                        from: "grouporders",
                        localField: "id_group_order",
                        foreignField: "_id",
                        as: "id_group_order"
                    }
                },
                { $unwind: "$servicePop" },
                { $unwind: "$id_customer" },
                { $unwind: "$id_group_order" },
                {
                    $addFields: {
                        service: {
                            "_id": {
                                "_id": "$servicePop._id",
                                "title": "$servicePop.title"
                            },
                            "optional_service": "$service.optional_service"
                        }
                    }
                },
                {
                    $project: {
                        servicePop: 0,
                        id_customer: POPULATE_ID_CUSTOMER,
                        id_group_order: POPULATE_ID_GROUP_ORDER,
                    }

                },

            ])
            return {
                start: iPage.start,
                length: iPage.length,
                totalItem: arrItem.length,
                data: arrItem.length > 0 ? arrItem : []
            };
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async scheduleWork(lang, iPage: iPageOrderScheduleWorkDTOCollaborator, idUser) {
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
                    $and: [
                        { date_work: { $lte: iPage.end_date } },
                        { date_work: { $gte: iPage.start_date } }
                    ]
                },
                {
                    id_collaborator: idUser
                },
                {
                    $or: [
                        { status: "confirm" },
                        { status: "doing" }
                    ]
                }
                ]
            }
            const arrItem = await this.orderModel.find(query)
                .sort({ date_work: 1, _id: 1 })
                .skip(iPage.start)
                .limit(iPage.length)
                .populate({ path: 'service._id', select: { title: 1 } })
                .populate({ path: 'id_customer', select: { avatar: 1, full_name: 1, name: 1, code_phone_area: 1, phone: 1, gender: 1 } })
                .populate({ path: 'service.optional_service._id', select: { position: 1, screen: 1, type: 1, title: 1 } })
                .then();
            const count = await this.orderModel.count(query)
            const result = {
                start: iPage.start,
                length: iPage.length,
                totalItem: count,
                start_date: iPage.start_date,
                end_date: iPage.end_date,
                data: arrItem
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async historyJob(lang, iPage: iPageHistoryOrderDTOCollaborator, idUser) {
        try {
            const query = {
                $and: [
                    {
                        id_collaborator: idUser
                    },
                    {
                        $and: [
                            { date_work: { $lte: iPage.end_date } },
                            { date_work: { $gte: iPage.start_date } }
                        ]
                    },
                    {
                        $and: [
                            { status: "done" },
                            { status: "cancel" },
                        ]
                    },
                    {
                        delete: false
                    }
                ]
            }
            const arrItem = await this.orderModel.find(query)
                .sort({ date_work: 1, _id: 1 })
                .skip(iPage.start)
                .limit(iPage.length)
                .populate({ path: 'service._id', select: { title: 1 } })
                .populate({ path: 'id_customer', select: { avatar: 1, full_name: 1, name: 1, code_phone_area: 1, phone: 1, gender: 1 } })
                .populate({ path: 'service.optional_service._id', select: { position: 1, screen: 1, type: 1, title: 1 } })
                .then();
            const count = await this.orderModel.count(query)
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

    async historyJobDone(lang, iPage: iPageHistoryOrderDTOCollaborator, idUser) {
        try {
            const query = {
                $and: [
                    {
                        id_collaborator: idUser
                    },
                    {
                        $and: [
                            { date_work: { $lte: iPage.end_date } },
                            { date_work: { $gte: iPage.start_date } }
                        ]
                    },
                    {
                        status: "done"
                    },
                    {
                        is_delete: false
                    }
                ]
            }

            const arrItem = await this.orderModel.find(query)
                .sort({ date_work: 1, _id: 1 })
                .skip(iPage.start)
                .limit(iPage.length)
                .populate({ path: 'service._id', select: { title: 1 } })
                .populate({ path: 'id_customer', select: { avatar: 1, full_name: 1, name: 1, code_phone_area: 1, phone: 1, gender: 1 } })
                .populate({ path: 'service.optional_service._id', select: { position: 1, screen: 1, type: 1, title: 1 } })
                .then();
            const count = await this.orderModel.count(query)
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

    async getConfirmOrder(lang, iPage: iPageDTO, idUser) {
        try {
            const query = {
                $and: [
                    {
                        id_collaborator: idUser
                    },
                    {
                        $or: [
                            { status: "confirm" },
                            { status: "doing" }
                        ]
                    },
                    {
                        is_active: true
                    }
                ]
            }
            const arrItem = await this.orderModel.find(query)
                .sort({ date_work: 1, _id: 1 })
                .skip(iPage.start)
                .limit(iPage.length)
                .populate({ path: 'service._id', select: { title: 1 } })
                .populate({ path: 'id_customer', select: { avatar: 1, full_name: 1, name: 1, code_phone_area: 1, phone: 1, gender: 1 } })
                .populate({ path: 'service.optional_service._id', select: { position: 1, screen: 1, type: 1, title: 1 } })
                .populate({
                    path: 'id_group_order', select: {
                        date_work_schedule: 1, type: 1, time_schedule: 1, is_auto_order: 1,
                        temp_final_fee: 1, temp_initial_fee: 1, temp_net_income_collaborator: 1, temp_pending_money: 1, temp_refund_money: 1, temp_platform_fee: 1,
                        final_fee: 1, initial_fee: 1, net_income_collaborator: 1, pending_money: 1, refund_money: 1, platform_fee: 1
                    }
                })
                .then();
            const count = await this.orderModel.count(query)
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

    async orderDetail(lang, user, id) {
        try {
            const order = await this.orderModel.findById(id)
                .populate({ path: 'id_customer', select: { avatar: 1, full_name: 1, name: 1, code_phone_area: 1, phone: 1, gender: 1 } })
                .populate({ path: 'service._id', select: { title: 1 } })
                .populate({ path: 'service.optional_service._id', select: { position: 1, screen: 1, type: 1, title: 1, is_main_optional: 1 } })
                .populate({
                    path: 'id_group_order', select: {
                        date_work_schedule: 1, type: 1, time_schedule: 1, is_auto_order: 1, day_loop: 1,
                        temp_final_fee: 1, temp_initial_fee: 1, temp_net_income_collaborator: 1, temp_pending_money: 1, temp_refund_money: 1, temp_platform_fee: 1,
                        final_fee: 1, initial_fee: 1, net_income_collaborator: 1, pending_money: 1, refund_money: 1, platform_fee: 1
                    }
                })
            if (!order) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            return order;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async collaboratorEditPedingConfirm(lang, user, id, subjectAction, version?) {
        try {
            const collaborator = await this.collaboratorRepositoryService.findOneById(user._id);

            const result = await this.orderSystemService.orderPendingToConfirm(lang, id, collaborator, subjectAction, null, version, true);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async collaboratorEditConfirmDoing(lang, user, id, subjectAction, version?) {
        try {
            // const getItem = await this.orderModel.findById(id);
            // if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            // if (getItem.status === "cancel") throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_CANCELED, lang, null)], HttpStatus.NOT_FOUND);
            // const query = {
            //     $and: [
            //         {
            //             id_collaborator: user._id,
            //         },
            //         {
            //             status: "doing",
            //         }
            //     ]
            // }
            // const getOrderDoing = await this.orderModel.find(query);
            // if (getOrderDoing.length > 0) throw new HttpException([await this.customExceptionService.i18nError(ERROR.NEED_DONE_ORDER, lang, null)], HttpStatus.FORBIDDEN);
            // const dateWork = new Date(getItem.date_work).getTime();
            // const dateNow = new Date(Date.now()).getTime();
            // // if ((dateWork - dateNow) > 900000) throw new HttpException([await this.customExceptionService.i18nError(ERROR.COLLABORATOR.NOT_YET_TIME_WORK, lang, null)], HttpStatus.NOT_FOUND);
            // getItem.status = "doing"
            // const getGroupOrder = await this.groupOrderModel.findById(getItem.id_group_order);
            // getGroupOrder.status = 'doing';
            // /// update id doanh nghiệp khi nhận việc
            // if (user.id_business) {
            //     getItem.id_business = user.id_business
            // }
            // /// update id doanh nghiệp khi nhận việc
            // const index = getGroupOrder.date_work_schedule.findIndex(x => x.date === getItem.date_work);
            // if (index > -1) getGroupOrder.date_work_schedule[index].status = "doing"
            // getGroupOrder.collaborator_version = (version) ? version.toString() : '0';
            // await getGroupOrder.save();
            // getItem.id_collaborator = user._id
            // const result = await getItem.save();
            // this.activityCollaboratorSystemService.doingOrder(user._id, result, getGroupOrder._id)
            // return result;
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(user._id);

            const result = await this.orderSystemService.orderConfirmToDoing(lang, id, getCollaborator, subjectAction, null)
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async collaboratorEditDoingDone(lang, user, id, subjectAction, version?) {
        try {
            const collaborator = await this.collaboratorRepositoryService.findOneById(user._id);

            const result = await this.orderSystemService.orderDoingToDone(lang, id, collaborator, subjectAction, null, version);
            if (result.groupOrder.type === "loop" && result.groupOrder.is_auto_order === true) {
                await this.groupOrderSystemService.createLoopGroupOrder(lang, result.groupOrder);
            }
            return result.order;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async cancelJob(lang, user, idOrder, idReasonCancel) {
        try {
            const is_punish = true;
            await this.orderSystemService.collaboratorCancelOrder(lang, idOrder, idReasonCancel, null, is_punish)
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async reasonCancel(lang, user, iPage) {
        try {
            const query = {
                $and: [
                    {
                        apply_user: "collaborator",
                    },
                    {
                        is_active: true,
                    },
                    {
                        is_delete: false,
                    }
                ]
            }
            const arrItem = await this.reasonCancelModel.find(query)
                .sort({ date_create: -1, _id: 1 })
                .skip(iPage.start)
                .limit(iPage.length)
                .then();
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

    async listMyJobs(lang, iPage: iPageOrderScheduleWorkDTOCollaborator, idUser) {
        try {
            const query = {
                $and: [
                    {
                        $and: [
                            { date_work: { $lte: iPage.end_date } },
                            { date_work: { $gte: iPage.start_date } }
                        ]
                    },
                    {
                        id_collaborator: idUser
                    },
                    {
                        $or: [
                            { status: "confirm" },
                            { status: "doing" }
                        ]
                    }
                ]
            }
            const arrItem = await this.orderModel.find(query)
                .sort({ date_work: 1, _id: 1 })
                // .skip(iPage.start)
                // .limit(iPage.length)
                .populate({ path: 'service._id', select: { title: 1 } })
                .populate({ path: 'id_customer', select: { avatar: 1, full_name: 1, name: 1, code_phone_area: 1, phone: 1, gender: 1 } })
                .populate({ path: 'service.optional_service._id', select: { position: 1, screen: 1, type: 1, title: 1 } })
                .then();
            const count = await this.orderModel.count(query)
            const result = {
                // start: iPage.start,
                // length: iPage.length,
                totalItem: count,
                start_date: iPage.start_date,
                end_date: iPage.end_date,
                data: arrItem
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getTotalJobsHours(lang, iPage: iPageOrderScheduleWorkDTOCollaborator, user) {
        try {
            const query = {
                $and: [
                    { status: 'done' },
                    { id_collaborator: user._id },
                    { is_delete: false },
                    { date_work: { $lte: iPage.end_date } },
                    { date_work: { $gte: iPage.start_date } }
                ]
            }
            const getTotalMoney = await this.orderModel.aggregate([
                { $match: query },
                {
                    $group: {
                        _id: {},
                        total_hour: {
                            $sum: '$total_estimate'
                        },
                        total_jobs: TOTAL_ORDER
                    }
                }
            ])
            const result = {
                total_hours: getTotalMoney.length > 0 ? getTotalMoney[0].total_hour : 0,
                total_jobs: getTotalMoney.length > 0 ? getTotalMoney[0].total_jobs : 0
            }
            return result
        }
        catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    async cancelOrder(lang, user, idOrder, idCancel, ) {
        try {
            const stepCancel = {
                isCancel: false,
                isRefundCustomer: false,
                isRefundCollaborator: true,
                isPunishCollaborator: true,
                isPunishCustomer: false,
                isUnassignCollaborator: true,
                isMinusNextOrderCollaborator: false
            }
            // const subjectAction = user._id.toString()
            const getOrder = await this.orderRepositoryService.findOneById(idOrder);
            if(!getOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "order")], HttpStatus.NOT_FOUND);
            const dateWork = new Date(getOrder.date_work).getTime();
            const dateNow = new Date(Date.now()).getTime();
            const timeNow = new Date().getTime();
            const timeCancelJob = dateWork - dateNow;
            const minute = timeCancelJob / 60;
            if(minute < 16) {
                stepCancel.isCancel = true;
                stepCancel.isUnassignCollaborator = false;
            }
            const subjectAction = {
                _id: user._id.toString(),
                type: "collaborator"
            }
            const result = await this.orderSystemService2.cancelOrder(lang, subjectAction, idOrder, idCancel, stepCancel)
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
