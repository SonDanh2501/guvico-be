import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { addCollaboratorDTOAdmin, Customer, CustomerDocument, ERROR, GlobalService, HistoryActivity, HistoryActivityDocument, iPageDTO, iPageReportGroupOrderDTOAdmin, LOOKUP_GROUP_ORDER, LOOKUP_PUNISH, PERCENT_INCOME, POP_COLLABORATOR_INFO, POP_CUSTOMER_INFO, previousBalanceCollaboratorDTO, TEMP_DISCOUNT, TEMP_PUNISH, TEMP_SERVICE_FEE, TOTAL_COLLABORATOR_FEE, TOTAL_DISCOUNT, TOTAL_GROSS_INCOME, TOTAL_INCOME, TOTAL_NET_INCOME, TOTAL_NET_INCOME_BUSINESS, TOTAL_ORDER, TOTAL_ORDER_FEE, TOTAL_PUNISH, TOTAL_SERVICE_FEE, UserSystem, UserSystemDocument } from 'src/@core'
import { GroupOrder, GroupOrderDocument } from 'src/@core/db/schema/group_order.schema'
import { CollaboratorRepositoryService } from 'src/@repositories/repository-service/collaborator-repository/collaborator-repository.service'
import { CustomerRepositoryService } from 'src/@repositories/repository-service/customer-repository/customer-repository.service'
import { HistoryActivityRepositoryService } from 'src/@repositories/repository-service/history-activity-repository/history-activity-repository.service'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service'
import { CoreSystemService } from 'src/core-system/@core-system/core-system.service'
import { GroupOrderSystemService2 } from 'src/core-system/@core-system/group-order-system/group-order-system.service'
import { ActivityAdminSystemService } from 'src/core-system/activity-admin-system/activity-admin-system.service'
import { ActivityCollaboratorSystemService } from 'src/core-system/activity-collaborator-system/activity-collaborator-system.service'
import { ActivitySystemService } from 'src/core-system/activity-system/activity-system.service'
import { CollaboratorSystemService } from 'src/core-system/collaborator-system/collaborator-system.service'
import { CustomerSystemService } from 'src/core-system/customer-system/customer-system.service'
import { GroupOrderSystemService } from 'src/core-system/group-order-system/group-order-system.service'
import { OrderSystemService } from 'src/core-system/order-system/order-system.service'
import { Collaborator, CollaboratorDocument } from '../../@core/db/schema/collaborator.schema'
import { Order, OrderDocument } from '../../@core/db/schema/order.schema'
import { Service, ServiceDocument } from '../../@core/db/schema/service.schema'

@Injectable()
export class GroupOrderManagerService {
    constructor(
        private customExceptionService: CustomExceptionService,
        private jwtService: JwtService,
        private generalHandleService: GeneralHandleService,
        private activityCollaboratorSystemService: ActivityCollaboratorSystemService,
        private activityAdminSystemService: ActivityAdminSystemService,
        private orderSystemService: OrderSystemService,
        private groupOrderSystemService: GroupOrderSystemService,
        private globalService: GlobalService,
        private collaboratorRepositoryService: CollaboratorRepositoryService,
        private customerRepositoryService: CustomerRepositoryService,
        private customerSystemService: CustomerSystemService,
        private collaboratorSystemService: CollaboratorSystemService,

        private activitySystemService: ActivitySystemService,

        private coreSystemService: CoreSystemService,
        private groupOrderSystemService2: GroupOrderSystemService2,

        private historyActivityRepositoryService: HistoryActivityRepositoryService,

        // private i18n: I18nContext,
        @InjectModel(GroupOrder.name) private groupOrderModel: Model<GroupOrderDocument>,
        @InjectModel(UserSystem.name) private userSystemModel: Model<UserSystemDocument>,
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
        @InjectModel(Collaborator.name) private collaboratorModel: Model<CollaboratorDocument>,
        @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
        @InjectModel(HistoryActivity.name) private historyActivityModel: Model<HistoryActivityDocument>,


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
            const arrItem = await this.groupOrderModel.find(query)
                .skip(iPage.start)
                .limit(iPage.length).then();
            const count = await this.groupOrderModel.count(query)
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

    async getListGroupOrderExpired(lang, iPage) {
        try {

            let query: any = {
                $and: [
                    { date_create: { $gte: iPage.start_date } },
                    { date_create: { $lte: iPage.end_date } },
                    {
                        $or: [
                            {
                                $or: [{
                                    name_collaborator: { $exists: false }
                                },
                                {

                                    name_collaborator: {
                                        $regex: iPage.search,
                                        $options: "i"
                                    }
                                },]
                            },
                            {
                                $or: [
                                    {
                                        phone_collaborator: { $exists: false }
                                    },
                                    {
                                        phone_collaborator: {
                                            $regex: iPage.search,
                                            $options: "i"
                                        }
                                    }]
                            },
                            {
                                $or: [
                                    {
                                        name_customer: { $exists: false }
                                    }
                                    ,
                                    {
                                        name_customer: {
                                            $regex: iPage.search,
                                            $options: "i"
                                        }
                                    }]
                            },
                            {
                                $or: [{
                                    phone_customer: { $exists: false }
                                }, {
                                    phone_customer: {
                                        $regex: iPage.search,
                                        $options: "i"
                                    }
                                }]
                            },
                            {
                                $or: [{
                                    id_view: { $exists: false }
                                }, {
                                    id_view: {
                                        $regex: iPage.search,
                                        $options: "i"
                                    }
                                }]
                            },
                            {
                                address: {
                                    $regex: iPage.search,
                                    $options: "i"
                                }
                            }
                        ]
                    },
                    { is_delete: false },
                    { id_cancel_system: { $ne: null } },
                    { status: "cancel" },
                ],
            }

            if (iPage.status === "system") {
                query.$and.push({ id_cancel_collaborator: { $size: 0 } })
            } else if (iPage.status === "collaborator") {
                query.$and.push({ id_cancel_collaborator: { $gt: { $size: 0 } } });
            }
            const arrItem = await this.groupOrderModel.find(query)
                .sort({ 'id_cancel_system.date_create': -1 })
                .populate(POP_CUSTOMER_INFO)
                .populate({ path: 'service._id', select: { _id: 1, title: 1, description: 1, id_group_service: 1, kind: 1, } })
                .populate({ path: 'id_cancel_collaborator.id_collaborator', select: { full_name: 1, name: 1, phone: 1, avatar: 1 } })
                .skip(iPage.start)
                .limit(iPage.length).then();
            const count = await this.groupOrderModel.count(query)
            const result = {
                start: iPage.start,
                length: iPage.length,
                totalItem: count,
                data: arrItem,
                // city: city,
                // district: district

            }
            return result;
            // }

        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    async getDetailItem(lang, id: string) {
        try {
            const findItem = await this.groupOrderModel.findById(id)
                .populate({ path: "code_promotion._id", select: { title: 1 } })
                .populate({ path: "event_promotion._id", select: { title: 1 } });
            if (!findItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            return findItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);

        }
    }

    // async createItem(lang, payload: createGroupCustomerDTOAdmin) {
    //     try {
    //         const newItem = new this.groupOrderModel({
    //             name: payload.name,
    //             description: payload.description,
    //             date_create: new Date(Date.now()),
    //             condition_in: payload.condition_in,
    //             condition_out: payload.condition_out
    //         });
    //         await newItem.save();
    //         return newItem;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }

    async editItem(lang, payload, id: string, idAdmin: string) {
        try {
            const result = await this.groupOrderSystemService.editGroupOrder(lang, id, payload, idAdmin);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    // async deleteItem(lang, id: string) {
    //     try {
    //         await this.groupOrderModel.findByIdAndDelete(id);
    //         return `Delete ${id} successfully`;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);

    //     }
    // }

    async deleteGroupOrder(lang, idGroupOrder, admin: UserSystemDocument) {
        try {
            const getGroupOrder = await this.groupOrderModel.findById(idGroupOrder);
            if (!getGroupOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.FORBIDDEN);
            if (getGroupOrder.status === 'pending' || getGroupOrder.status === 'doing' || getGroupOrder.status === 'confirm') throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_DELETED, lang, null)], HttpStatus.FORBIDDEN);
            const getOrder = await this.orderModel.findById(getGroupOrder.id_order[0]);
            if (!getOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_NOT_FOUND, lang, null)], HttpStatus.FORBIDDEN);
            if (getOrder.status === 'pending' || getOrder.status === 'doing' || getOrder.status === 'confirm') throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_DELETED, lang, null)], HttpStatus.FORBIDDEN);
            if (getGroupOrder.type !== 'schedule') {
                getOrder.is_delete = true;
                getGroupOrder.is_delete = true;
                await getOrder.save();
                await getGroupOrder.save();
                await this.activityAdminSystemService.adminDeleteGroupOrder(admin._id, idGroupOrder);
            } else if (getGroupOrder.type === 'schedule') {
                const getArrOrder = await this.orderModel.find({ id_group_order: getGroupOrder._id, is_delete: false })
                for (let order of getArrOrder) {
                    order.is_delete = true;
                    await order.save();
                }
            }
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);;

        }
    }

    async changeCancelToDone(lang, idGroupOrder, admin: UserSystemDocument) {
        try {
            const getGroupOrder = await this.groupOrderModel.findById(idGroupOrder);
            if (!getGroupOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.FORBIDDEN);
            if (getGroupOrder.city > 0) {
                const checkPermisstion = await this.globalService.checkPermissionArea(admin, getGroupOrder.city);
                if (!checkPermisstion.permisstion) {
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
                }
            }
            if (getGroupOrder.status !== 'cancel') throw new HttpException([await this.customExceptionService.i18nError(ERROR.DO_NOT_CHANGE_STATUS, lang, null)], HttpStatus.FORBIDDEN);
            if (getGroupOrder.id_collaborator === null) throw new HttpException([await this.customExceptionService.i18nError(ERROR.DO_NOT_CHANGE_STATUS, lang, null)], HttpStatus.FORBIDDEN);
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(getGroupOrder.id_collaborator.toString());
            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, null)], HttpStatus.FORBIDDEN);
            const getService = await this.serviceModel.findById(getGroupOrder.service["_id"]);
            if (!getService) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "service")], HttpStatus.NOT_FOUND);
            const previousBalance = {
                gift_remainder: getCollaborator.gift_remainder,
                remainder: getCollaborator.remainder
            }
            let tempRemainder = 0;
            let getOrder;
            tempRemainder = getCollaborator.gift_remainder - getGroupOrder.temp_platform_fee;
            // if (getGroupOrder.payment_method === "cash") {
            tempRemainder = tempRemainder - getGroupOrder.temp_pending_money;
            // }
            if (tempRemainder < 0) {
                const tempRemainderAbs = Math.abs(tempRemainder);
                if (getCollaborator.remainder < tempRemainderAbs) throw new HttpException([await this.customExceptionService.i18nError(ERROR.COLLABORATOR_NOT_ENOUGH_REMAINDER, lang, null)], HttpStatus.NOT_FOUND);
                getCollaborator.remainder = getCollaborator.remainder - tempRemainderAbs;
                getCollaborator.gift_remainder = 0;
            } else {
                getCollaborator.gift_remainder = tempRemainder;
            }
            if (getGroupOrder.type === 'schedule') {
                throw new HttpException('Dịch vụ không hỗ trợ', HttpStatus.FORBIDDEN);
            } else if (getGroupOrder.type === 'loop' && getGroupOrder.is_auto_order === true) {
                getOrder = await this.orderModel.findById(getGroupOrder.id_order[getGroupOrder.id_order.length - 1]);
                if (!getOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.FORBIDDEN);
                getOrder.status = 'done';
            } else if (getGroupOrder.type === 'loop' && getGroupOrder.is_auto_order === false) {
                getOrder = await this.orderModel.findById(getGroupOrder.id_order[0]);
                if (!getOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.FORBIDDEN);
                getOrder.status = 'done';
            } else {
                throw new HttpException('Dịch vụ không hỗ trợ', HttpStatus.FORBIDDEN);
            }
            this.activityAdminSystemService.adminChangeCancelToDone(admin._id, idGroupOrder, getGroupOrder.temp_platform_fee);
            this.activityCollaboratorSystemService.minusPlatformFee(getCollaborator, getGroupOrder.temp_platform_fee, getOrder._id, getService, getGroupOrder._id, previousBalance);
            getGroupOrder.status = 'done';
            await getCollaborator.save();
            await getGroupOrder.save();
            await getOrder.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);

        }
    }

    async cancelGroupOrderBackup(lang, idGroupOrder, admin) {
        try {
            const getGroupOrder = await this.groupOrderModel.findById(idGroupOrder);
            if (!getGroupOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.FORBIDDEN);
            if (getGroupOrder.city > 0) {
                const checkPermisstion = await this.globalService.checkPermissionArea(admin, getGroupOrder.city);
                if (!checkPermisstion.permisstion) {
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
                }
            }
            if (getGroupOrder.status === 'cancel' || getGroupOrder.status === 'doing' || getGroupOrder.status === 'done') throw new HttpException([await this.customExceptionService.i18nError(ERROR.DO_NOT_CHANGE_STATUS, lang, null)], HttpStatus.FORBIDDEN);
            if (getGroupOrder.type === 'schedule') {

            } else if (getGroupOrder.type === 'loop' && getGroupOrder.is_auto_order === true) {

            } else if (getGroupOrder.type === 'loop' && getGroupOrder.is_auto_order === false) {
                const getOrder = await this.orderModel.find({ id_group_order: getGroupOrder._id });
                const getCustomer = await this.customerRepositoryService.findOneById(getGroupOrder.id_customer.toString());
                if (getGroupOrder.status === 'pending') {
                    if (getOrder[0].payment_method === 'point') {
                        getCustomer.pay_point += getOrder[0].final_fee;
                    }
                    getGroupOrder.date_work_schedule[0].status = 'cancel';
                    getOrder[0].status = 'cancel';
                    getGroupOrder.status = 'cancel';
                    getOrder[0].id_cancel_user_system = {
                        id_user_system: admin._id,
                    }
                    getGroupOrder.id_cancel_user_system = {
                        id_user_system: admin._id,
                    }
                    await this.activityAdminSystemService.adminChangeStatusOrderToCancel(admin._id, getOrder[0]._id, null, getGroupOrder._id);
                } else if (getGroupOrder.status === 'confirm') {
                    const getCollaborator = await this.collaboratorRepositoryService.findOneById(getGroupOrder.id_collaborator.toString());
                    if (getOrder[0].payment_method === 'point') {
                        getCustomer.pay_point += getOrder[0].final_fee;
                    }
                    getOrder[0].status = 'cancel';
                    getGroupOrder.status = 'cancel';
                    getCollaborator.gift_remainder += getOrder[0].platform_fee;
                    getOrder[0].id_cancel_user_system = {
                        id_user_system: admin._id,
                    }
                    getGroupOrder.id_cancel_user_system = {
                        id_user_system: admin._id,
                    }
                    await getCollaborator.save();
                    await this.activityAdminSystemService.adminChangeStatusOrderToCancel(admin._id, getOrder[0]._id, getCollaborator._id, getGroupOrder._id);
                }
            }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);;
        }
    }

    async addCollaborator(lang, payload: addCollaboratorDTOAdmin, idGroupOrder, admin) {
        try {
            const getGroupOrder = await this.groupOrderModel.findById(idGroupOrder);
            if (!getGroupOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, 'group order')], HttpStatus.BAD_REQUEST);
            // if (getGroupOrder.city > 0) {
            //     const checkPermisstion = await this.globalService.checkPermissionArea(admin, getGroupOrder.city);
            //     if (!checkPermisstion.permisstion) {
            //         throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            //     }
            // } 
            const getOrder = await this.orderModel.findOne({ id_group_order: getGroupOrder._id, status: "pending", is_duplicate: false });
            if (!getOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, 'order')], HttpStatus.BAD_REQUEST);
            const getCustomer = await this.customerRepositoryService.findOneById(getGroupOrder.id_customer.toString());
            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, 'customer')], HttpStatus.BAD_REQUEST);
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(payload.id_collaborator);
            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, 'collaborator')], HttpStatus.BAD_REQUEST);
            const getService = await this.serviceModel.findById(getGroupOrder.service["_id"]);
            if (!getService) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "service")], HttpStatus.NOT_FOUND);
            // if (getOrder.status === 'doing' || getOrder.status === 'done' || getOrder.status === 'cancel' || getOrder.status === 'confirm') { throw new HttpException([await this.customExceptionService.i18nError(ERROR.DONT_ADD_COLLABORATOR, lang, null)], HttpStatus.BAD_REQUEST); }
            if (getCollaborator.is_lock_time === true) {
                const dateNow = new Date(Date.now()).getTime();
                const dateLock = new Date(getCollaborator.lock_time).getTime();
                if (dateNow < dateLock) {
                    const time = await this.generalHandleService.convertMsToTime(dateLock - dateNow);
                    const property = {
                        property: time
                    }
                    throw new HttpException([await this.customExceptionService.i18nErrorWithProperty(ERROR.COLLABORATOR.IS_LOCK_TIME, lang, property, null)], HttpStatus.NOT_FOUND);
                } else {
                    getCollaborator.is_lock_time = false;
                    getCollaborator.lock_time = null;
                    getCollaborator.save();
                }
            }
            const result = await this.orderSystemService.orderPendingToConfirm(lang, getOrder._id, getCollaborator, null, null, null, payload.check_time);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);;
        }
    }

    async reportGroupOrderV2(lang, iPage: iPageReportGroupOrderDTOAdmin, admin: UserSystemDocument) {
        try {
            /////////////////// phần phân quyền/ nhượng quyền khu vực ///////////////////
            if (iPage.city) {
                iPage.city = await this.globalService.convertDistrictOrCityToArray(iPage.city)
            }
            if (iPage.district) {
                iPage.district = await this.globalService.convertDistrictOrCityToArray(iPage.district)
            }
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, iPage.city, iPage.district);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            /////////////////// phần phân quyền/ nhượng quyền khu vực ///////////////////


            let query: any = {
                $and: [
                    {
                        is_delete: false,
                    },
                    {
                        status: "done",
                    },
                    {
                        end_date_work: {
                            $gte: iPage.start_date,
                        },
                    },
                    {
                        end_date_work: {
                            $lte: iPage.end_date,
                        },
                    },
                ],
            }
            if (iPage.type_date !== 'date_work') {
                query.$and[2] = {
                    date_create: {
                        $gte: iPage.start_date,
                    },
                };
                query.$and[3] = {
                    date_create: {
                        $lte: iPage.end_date,
                    },
                };
            }
            /////////////////// phần phân quyền/ nhượng quyền khu vực ///////////////////
            if (iPage.city) {
                query.$and.push({ city: { $in: iPage.city } });
            } else if (checkPermisstion.city.length > 0) {
                query.$and.push({ city: { $in: checkPermisstion.city } });
            }
            if (iPage.district) {
                query.$and.push({
                    $or: [
                        { 'district': { $in: iPage.district } },
                        { district: [] }
                    ]
                });
            } else if (checkPermisstion.district.length > 0) {
                query.$and.push({
                    $or: [
                        { 'district': { $in: checkPermisstion.district } },
                        { district: [] }
                    ]
                });
            }
            if (admin.id_business) {
                /// nếu tài khoản admin của đối tác thì chỉ nhìn thấy các CTV của đối tác đó
                query.$and.push({ 'id_business': admin.id_business });
            }
            console.log('query  ', query.$and);

            const total = await this.orderModel.aggregate([
                {
                    $match: query
                },
                {
                    $addFields: TEMP_SERVICE_FEE
                },
                {
                    $addFields: TEMP_DISCOUNT
                },
                {
                    $lookup: LOOKUP_PUNISH
                },
                {
                    $addFields: TEMP_PUNISH
                },
                {
                    $group: {
                        _id: {},
                        total_order_fee: TOTAL_ORDER_FEE,
                        total_income: TOTAL_INCOME,
                        total_service_fee: TOTAL_SERVICE_FEE,
                        total_collabotator_fee: TOTAL_COLLABORATOR_FEE,
                        total_gross_income: TOTAL_GROSS_INCOME,
                        total_item: TOTAL_ORDER,
                        total_discount: TOTAL_DISCOUNT,
                        total_net_income: TOTAL_NET_INCOME,
                        total_net_income_business: TOTAL_NET_INCOME_BUSINESS,
                        punish: TOTAL_PUNISH
                    },
                },
                {
                    $addFields: PERCENT_INCOME
                }
            ]);

            const getGroupOrder = await this.orderModel.aggregate([
                {
                    $match: query
                },
                {
                    $addFields: TEMP_SERVICE_FEE
                },
                {
                    $addFields: TEMP_DISCOUNT
                },
                {
                    $lookup: LOOKUP_PUNISH
                },
                {
                    $addFields: TEMP_PUNISH
                },
                {
                    $group: {
                        _id: "$id_group_order",
                        total_order_fee: TOTAL_ORDER_FEE,
                        total_income: TOTAL_INCOME,
                        total_service_fee: TOTAL_SERVICE_FEE,
                        total_collabotator_fee: TOTAL_COLLABORATOR_FEE,
                        total_gross_income: TOTAL_GROSS_INCOME,
                        total_item: TOTAL_ORDER,
                        total_discount: TOTAL_DISCOUNT,
                        total_net_income: TOTAL_NET_INCOME,
                        total_net_income_business: TOTAL_NET_INCOME_BUSINESS,
                        punish: TOTAL_PUNISH,
                        date_work: { $push: '$date_work' }
                    },
                },
                {
                    $lookup: LOOKUP_GROUP_ORDER
                },
                {
                    $sort: { 'id_group_order.date_create': -1, _id: 1 }
                },
                {
                    $unwind: { path: '$id_group_order' }
                },
                {
                    $addFields: PERCENT_INCOME
                },
                {
                    $skip: Number(iPage.start)
                },
                {
                    $limit: Number(iPage.length)
                }
            ])

            const count = await this.orderModel.aggregate([
                {
                    $match: query
                },
                {
                    $group: { _id: '$id_group_order' }
                },
                {
                    $count: 'total'
                }
            ])
            const result = {
                start: Number(iPage.start),
                length: Number(iPage.length),
                total: total,
                totalItem: count.length > 0 ? count[0].total : 0,
                data: getGroupOrder
            }

            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);;
        }
    }


    async getHistoryOrderByGroupOrder(lang, iPage, admin: UserSystemDocument, idGroupOrder) {
        try {
            const getGroupOrder = await this.groupOrderModel.findById(idGroupOrder);
            if (!getGroupOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, getGroupOrder.city, getGroupOrder.district, getGroupOrder.service["_id"]);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            const query = {
                $or: [
                    {
                        id_group_order: new Types.ObjectId(idGroupOrder),
                    },
                    {
                        id_order: {$in: getGroupOrder.id_order}
                    }
                ]
            }
            // const arrItem = await this.historyActivityModel.find(query)
            //     .populate({ path: 'id_order', select: { id_view: 1 } })
            //     .populate(POP_CUSTOMER_INFO)
            //     .populate(POP_COLLABORATOR_INFO)
            //     .populate({ path: 'id_admin_action', select: { full_name: 1, } })
            //     .populate({ path: 'id_user_system', select: { full_name: 1, } })
            //     .populate({ path: 'id_reason_cancel', select: { title: 1, } })
            //     .sort({ date_create: -1, _id: 1 })
            //     .skip(iPage.start)
            //     .limit(iPage.length);
            // const count = await this.historyActivityModel.count(query)

            const populateArr = [
                POP_CUSTOMER_INFO,
                POP_COLLABORATOR_INFO,
                {
                    path: 'id_admin_action', select: { full_name: 1, }
                },
                {
                    path: 'id_user_system', select: { full_name: 1, }
                },
                {
                    path: 'id_reason_cancel', select: { title: 1, }
                },
                {
                    path: 'id_group_order', select: { id_view: 1, _id: 1 }
                },
                {
                    path: 'id_order', select: { id_view: 1, _id: 1 }
                },
            ]
            const resultData = await this.historyActivityRepositoryService.getListPaginationDataByCondition(iPage, query, {}, { date_create: -1, _id: 1 }, populateArr)


            // const result = {
            //     start: iPage.start,
            //     length: iPage.length,
            //     totalItem: resultData.totalItem,
            //     data: resultData.data
            // }
            return resultData;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async changeCollaborator(lang, idGroupOrder: string, admin: UserSystemDocument) {
        try {
            const getGroupOrder = await this.groupOrderModel.findById(idGroupOrder);
            if (!getGroupOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, 'group order')], HttpStatus.BAD_REQUEST);
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, getGroupOrder.city);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            if (getGroupOrder.id_collaborator === null) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_COLLABORATOR, lang, 'collaborator')], HttpStatus.BAD_REQUEST);
            }
            if (getGroupOrder.type !== 'loop' || getGroupOrder.status === 'done' || getGroupOrder.status === 'cancel') {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_SUPPORT_SERVICE, lang, 'service')], HttpStatus.BAD_REQUEST);
            }
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(getGroupOrder.id_collaborator.toString());
            const getService = await this.serviceModel.findById(getGroupOrder.service["_id"]);
            if (!getService) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, 'vi', null)], HttpStatus.NOT_FOUND);

            const query = {
                $and: [
                    { is_delete: false },
                    { id_group_order: idGroupOrder }
                ]
            }
            const getOrder = await this.orderModel.findOne(query)
            getGroupOrder.id_collaborator = null;
            getGroupOrder.name_collaborator = null;
            getGroupOrder.phone_collaborator = null;
            getGroupOrder.status = 'pending';
            await getGroupOrder.save();
            getOrder.id_collaborator = null;
            getOrder.name_collaborator = null;
            getOrder.phone_collaborator = null;
            getOrder.status = 'pending';
            await getOrder.save();
            const previousBalance: previousBalanceCollaboratorDTO = {
                gift_remainder: getCollaborator.gift_remainder,
                remainder: getCollaborator.remainder,
                collaborator_wallet: getCollaborator.collaborator_wallet,
                work_wallet: getCollaborator.work_wallet,
            }
            getCollaborator.gift_remainder += getOrder.platform_fee;
            getCollaborator.gift_remainder += getOrder.pending_money;
            this.activityCollaboratorSystemService.refundPlatformMoney(getCollaborator, (getOrder.platform_fee + getOrder.pending_money), getGroupOrder, getService, getOrder, previousBalance);
            // if (groupOrder.payment_method === "cash") this.activityCollaboratorSystemService.refundMoney(collaborator, findOrderIsUplicate.pending_money, groupOrder, getService, findOrderIsUplicate);
            await getCollaborator.save();
            this.activityAdminSystemService.adminChangeCollaborator(admin._id, getCollaborator._id, getGroupOrder._id);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async changeCollaboratorV2(lang, idGroupOrder: string, admin) {
        try {
            const getGroupOrder = await this.groupOrderModel.findById(idGroupOrder);
            if (!getGroupOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, 'group order')], HttpStatus.BAD_REQUEST);
            if (getGroupOrder.id_collaborator === null) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_COLLABORATOR, lang, 'collaborator')], HttpStatus.BAD_REQUEST);
            }
            if (getGroupOrder.status === 'done' || getGroupOrder.status === 'cancel' || getGroupOrder.status === 'doing') {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_SUPPORT_SERVICE, lang, 'service')], HttpStatus.BAD_REQUEST);
            }
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(getGroupOrder.id_collaborator.toString());
            const getService = await this.serviceModel.findById(getGroupOrder.service["_id"]);
            if (!getService) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, 'vi', null)], HttpStatus.NOT_FOUND);

            const query = {
                $and: [
                    { is_delete: false },
                    { id_group_order: idGroupOrder },
                    { status: "confirm" }
                ]
            }
            const getOrder = await this.orderModel.find(query).sort({ date_work: 1 });
            getGroupOrder.id_collaborator = null;
            getGroupOrder.name_collaborator = null;
            getGroupOrder.phone_collaborator = null;
            getGroupOrder.status = 'pending';
            await getGroupOrder.save();
            let temp_platform_fee = getOrder[0].platform_fee;
            let temp_pending_money = getOrder[0].pending_money;
            for (let i = 0; i < getOrder.length; i++) {
                getOrder[i].id_collaborator = null;
                getOrder[i].name_collaborator = null;
                getOrder[i].phone_collaborator = null;
                getOrder[i].status = 'pending';
                await getOrder[i].save();
            }
            const previousBalance: previousBalanceCollaboratorDTO = {
                gift_remainder: getCollaborator.gift_remainder,
                remainder: getCollaborator.remainder,
                collaborator_wallet: getCollaborator.collaborator_wallet,
                work_wallet: getCollaborator.work_wallet
            }
            getCollaborator.gift_remainder += temp_platform_fee;
            getCollaborator.gift_remainder += temp_pending_money;
            await getCollaborator.save();
            this.activityCollaboratorSystemService.refundPlatformMoney(getCollaborator, (temp_platform_fee + temp_pending_money), getGroupOrder, getService, getOrder[0], previousBalance);
            this.activityAdminSystemService.adminChangeCollaborator(admin._id, getCollaborator._id, getGroupOrder._id);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    async unassignCollaborator(lang, idGroupOrder, admin) {
        try {


            // const findCollaborator = await this.
            
            // const returnGroupOrder = await this.groupOrderSystemService.unassignCollaboratorFromGroupOrder(lang, idGroupOrder);

            // await this.activitySystemService.unassignCollaboratorFromGroupOrder(returnGroupOrder)
            return true;


        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async cancelGroupOrder(lang, user, idGroupOrder, idCancel) {
        try {


            const stepCancel = {
                isCancel: true,
                isRefundCustomer: true,
                isRefundCollaborator: true,
                isPunishCollaborator: false,
                isPunishCustomer: false,
                isUnassignCollaborator: false,
                isMinusNextOrderCollaborator: false
            }
            // const subjectAction = user._id.toString()
            const subjectAction = {
                _id: user._id.toString(),
                type: "admin"
            }
            this.groupOrderSystemService2.cancelGroupOrder(lang, subjectAction, idGroupOrder, idCancel, stepCancel)
            return true;

            // let getGroupOrder = await this.groupOrderSystemService.findItem(lang, idGroupOrder);
            // const getCustomer = await this.customerSystemService.findItem(lang, getGroupOrder.id_customer);
            // const subjectAction = user._id.toString();

            // // 1. huy don
            // const resultCancel = await this.groupOrderSystemService.cancelGroupOrder(lang, subjectAction, getGroupOrder, idCancel);

            // // 2. hoan tien cho KH
            // await this.customerSystemService.refundMoney(lang, "system", getCustomer._id, resultCancel.refundCustomer, getGroupOrder.payment_method, getGroupOrder._id);

            // // 3. hoan tien cho CTV
            // if(getGroupOrder.id_collaborator !== null) {
            // await this.collaboratorSystemService.refundMoney(lang, 'system', getGroupOrder.id_collaborator, resultCancel.refundCollaborator, "work_wallet", getGroupOrder._id)
            // }

            // // 4 phạt CTV

            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
}
