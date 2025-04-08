import { HttpException, HttpStatus, Injectable, OnApplicationBootstrap } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectModel } from '@nestjs/mongoose'
import { differenceInMinutes } from 'date-fns'
import { Model } from 'mongoose'
import { addCollaboratorDTOAdmin, adminCheckReviewDTOAdmin, changeStatusHandleReviewOrder, changeStatusOrderDTOAdmin, DeviceToken, DeviceTokenDocument, editOrderV2DTOAdmin, GlobalService, HistoryActivity, HistoryActivityDocument, iPageOrderDTOAdmin, iPageSearchOrderDTO, iPageTotalOrderDTOAdmin, Order, OrderDocument, previousBalanceCollaboratorDTO, PunishCollaboratorDTOAdmin, queryWithinRangeDate, searchQuery } from 'src/@core'
import { Collaborator, CollaboratorDocument } from 'src/@core/db/schema/collaborator.schema'
import { CollaboratorSetting, CollaboratorSettingDocument } from 'src/@core/db/schema/collaborator_setting.schema'
import { Customer, CustomerDocument } from 'src/@core/db/schema/customer.schema'
import { GroupOrderDocument } from 'src/@core/db/schema/group_order.schema'
import { Punish, PunishDocument } from 'src/@core/db/schema/punish.schema'
import { CollaboratorRepositoryService } from 'src/@repositories/repository-service/collaborator-repository/collaborator-repository.service'
import { CustomerRepositoryService } from 'src/@repositories/repository-service/customer-repository/customer-repository.service'
import { GroupOrderRepositoryService } from 'src/@repositories/repository-service/group-order-repository/group-order-repository.service'
import { OrderRepositoryService } from 'src/@repositories/repository-service/order-repository/order-repository.service'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service'
import { CoreSystemService } from 'src/core-system/@core-system/core-system.service'
import { OrderSystemService2 } from 'src/core-system/@core-system/order-system/order-system.service'
import { ActivityAdminSystemService } from 'src/core-system/activity-admin-system/activity-admin-system.service'
import { ActivityCollaboratorSystemService } from 'src/core-system/activity-collaborator-system/activity-collaborator-system.service'
import { CollaboratorSystemService } from 'src/core-system/collaborator-system/collaborator-system.service'
import { CustomerSystemService } from 'src/core-system/customer-system/customer-system.service'
import { GroupOrderSystemService } from 'src/core-system/group-order-system/group-order-system.service'
import { NotificationSystemService } from 'src/core-system/notification-system/notification-system.service'
import { OrderSystemService } from 'src/core-system/order-system/order-system.service'
import { NotificationService } from 'src/notification/notification.service'
import { ERROR } from '../../@core/constant/i18n.field'
import { GroupOrder } from '../../@core/db/schema/group_order.schema'
import { Service, ServiceDocument } from '../../@core/db/schema/service.schema'
import { UserSystem, UserSystemDocument } from '../../@core/db/schema/user_system.schema'
import { iPageDTO } from '../../@core/dto/general.dto'
import { PunishManagerService } from '../punish-manager/punish-manager.service'


@Injectable()
export class OrderManagerService implements OnApplicationBootstrap {
    constructor(
        // private globalService: GlobalService,
        private customExceptionService: CustomExceptionService,
        private jwtService: JwtService,
        private generalHandleService: GeneralHandleService,
        private activityCollaboratorSystemService: ActivityCollaboratorSystemService,
        private activityAdminSystemService: ActivityAdminSystemService,
        private orderSystemService: OrderSystemService,
        private groupOrderSystemService: GroupOrderSystemService,
        private collaboratorSystemService: CollaboratorSystemService,
        private customerSystemService: CustomerSystemService,
        private globalService: GlobalService,
        private notificationSystemService: NotificationSystemService,
        private punishManagerService: PunishManagerService,
        private notificationService: NotificationService,
        private orderRepositoryService: OrderRepositoryService,
        private groupOrderRepositoryService: GroupOrderRepositoryService,
        private collaboratorRepositoryService: CollaboratorRepositoryService,
        private customerRepositoryService: CustomerRepositoryService,
        private coreSystemService: CoreSystemService,
        private orderSystemService2: OrderSystemService2,




        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
        @InjectModel(Collaborator.name) private collaboratorModel: Model<CollaboratorDocument>,
        @InjectModel(GroupOrder.name) private groupOrderModel: Model<GroupOrderDocument>,
        @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
        @InjectModel(UserSystem.name) private userSystemModel: Model<UserSystemDocument>,
        @InjectModel(Punish.name) private punishModel: Model<PunishDocument>,
        @InjectModel(DeviceToken.name) private deviceTokenModel: Model<DeviceTokenDocument>,
        @InjectModel(HistoryActivity.name) private historyActivityModel: Model<HistoryActivityDocument>,
        @InjectModel(CollaboratorSetting.name) private collaboratorSettingModel: Model<CollaboratorSettingDocument>,
    ) { }


    async onApplicationBootstrap(): Promise<any> {
        try {
            const getListOrder = await this.orderModel.find({
                location: { $exists: false }
            }).then();
            for (const item of getListOrder) {
                await this.orderModel.findByIdAndUpdate({ _id: item._id }, {
                    location: {
                        type: "Point",
                        coordinates: [Number(item.lng), Number(item.lat)]
                    }
                })
            }
        } catch (err) {
            console.log(err, 'err')
        }
    }

    async getList(lang, iPage: iPageOrderDTOAdmin, admin: UserSystemDocument) {
        const myArray = iPage.id_service.split(",");
        try {
            let query;
            if (!iPage.id_service) {
                query = {
                    $and: [{
                        $or: [{
                            name: {
                                $regex: iPage.search,
                                $options: "i"
                            },
                        },]
                    },
                    {
                        is_delete: false
                    }
                    ],
                }
            }
            else if (iPage.id_service) {
                query = {
                    $and: [{
                        $or: [{
                            name: {
                                $regex: iPage.search,
                                $options: "i"
                            },
                        },]
                    },
                    {
                        is_delete: false
                    },
                    {
                        "service._id": myArray
                    }
                    ],
                }
            }
            const arrItem = await this.orderModel.find(query)
                .sort({ date_work: -1 })
                .skip(iPage.start)
                .limit(iPage.length)
                .populate({ path: 'service._id', select: { title: 1 } })
                .populate({ path: 'id_customer', select: { name: 1, phone: 1 } })
                .populate({ path: 'id_collaborator', select: { name: 1, phone: 1 } })
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

    async getDetailItem(lang, id: string, admin: UserSystemDocument) {
        try {
            const getOrder = await this.orderModel.findById(id)
                .populate({ path: 'id_customer' })
                .populate({ path: 'service._id' })
                .populate({ path: 'id_group_order', select: { type: 1, is_auto_order: 1 } })
                .populate({ path: 'service.optional_service._id', select: { type: 1, title: 1 } })
                .populate({ path: "code_promotion._id", select: { title: 1 } })
                .populate({ path: "event_promotion._id", select: { title: 1 } })
                .populate({ path: 'id_collaborator' });
            if (!getOrder)
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            // const checkPermisstion = await this.globalService.checkPermissionArea(admin, getOrder.city);
            // if (!checkPermisstion.permisstion) {
            //     throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            // }
            return getOrder;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], HttpStatus.BAD_REQUEST);
        }
    }

    // async changeStatusOrder(lang, idOrder: string, payload: changeStatusOrderDTOAdmin, idAdmin) {
    //     try {
    //         const item = await this.orderModel.findById(idOrder);
    //         if (!item) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "order")], HttpStatus.BAD_REQUEST);
    //         const getCustomer = await this.customerModel.findById(item.id_customer);
    //         let getCollaborator;
    //         if(payload.id_collaborator){
    //             getCollaborator = await this.collaboratorModel.findById(payload.id_collaborator);
    //         } else {
    //             getCollaborator = await this.collaboratorModel.findById(item.id_collaborator);
    //         }
    //         if (item.status === "confirm" && payload.status === "cancel") {
    //             item.status = payload.status
    //             getCollaborator.gift_remainder += item.platform_fee
    //             if (item.payment_method === "point") {
    //                 getCustomer.pay_point += item.final_fee
    //             }
    //             await Promise.all([
    //                 await item.save(),
    //                 await getCustomer.save(),
    //                 await getCollaborator.save()
    //             ]);
    //         }
    //         else if (item.status === "pending" && payload.status === "cancel") {
    //             item.status = payload.status
    //             if (item.payment_method === "point") {
    //                 getCustomer.pay_point += item.final_fee
    //             }
    //             await Promise.all([
    //                 await item.save(),
    //                 await getCustomer.save(),
    //             ]);
    //         }
    //         else if (item.status === "confirm" && payload.status === "pending") {
    //             item.status = payload.status
    //             getCollaborator.gift_remainder += item.platform_fee
    //             if (item.payment_method === "point") {
    //                 getCustomer.pay_point += item.final_fee
    //             }
    //             await Promise.all([
    //                 await item.save(),
    //                 await getCustomer.save(),
    //                 await getCollaborator.save()
    //             ]);
    //         }
    //         // if (payload.status === 'cancel') {
    //         //     if (item.status === 'pending') {
    //         //         if (item.payment_method === 'point') {
    //         //             item.status = 'cancel';
    //         //             getCustomer.pay_point += item.final_fee;
    //         //             await Promise.all([
    //         //                 await item.save(),
    //         //                 await getCustomer.save(),
    //         //             ]);
    //         //         } else if (item.payment_method === 'cash') {
    //         //             item.status = 'cancel';
    //         //             await item.save();
    //         //         } else {
    //         //             throw new HttpException([await this.customExceptionService.i18nError(ERROR.PAYMENT_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
    //         //         }
    //         //     } else if (item.status === 'confirm') {
    //         //         if (item.payment_method === 'point') {
    //         //             getCustomer.pay_point += item.final_fee;
    //         //             getCollaborator.gift_remainder += Number(item.pending_money + item.platform_fee);
    //         //             item.status = 'cancel';
    //         //             await Promise.all([
    //         //                 await item.save(),
    //         //                 await getCustomer.save(),
    //         //                 await getCollaborator.save()
    //         //             ]);
    //         //         } else if (item.payment_method === 'cash') {
    //         //             getCollaborator.gift_remainder += Number(item.pending_money + item.platform_fee);
    //         //             item.status = 'cancel';
    //         //             await Promise.all([
    //         //                 await item.save(),
    //         //                 await getCollaborator.save()
    //         //             ]);
    //         //         } else {

    //         //         }
    //         //     } else {
    //         //         throw new HttpException([await this.customExceptionService.i18nError(ERROR.DO_NOT_CHANGE_STATUS, lang, null)], HttpStatus.BAD_REQUEST);
    //         //     }
    //         // } else if (payload.status === 'pending') {
    //         //     if (item.status === 'confirm') {
    //         //         getCollaborator.gift_remainder += Number(item.final_fee + item.pending_money);
    //         //         item.id_cancel_user_system = idAdmin;
    //         //         item.id_collaborator = null;
    //         //         await Promise.all([
    //         //             await item.save(),
    //         //             await getCollaborator.save(),
    //         //         ]);
    //         //     } else {
    //         //         throw new HttpException([await this.customExceptionService.i18nError(ERROR.DO_NOT_CHANGE_STATUS, lang, null)], HttpStatus.BAD_REQUEST);
    //         //     }

    //         // } else if (payload.status === 'confirm') {
    //         //     const dateNow = new Date(Date.now()).getTime();
    //         //     if(!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "collaborator")], HttpStatus.NOT_FOUND);
    //         //     if (getCollaborator.is_lock_time === true) {
    //         //         const dateLock = new Date(getCollaborator.lock_time).getTime();
    //         //         if (dateNow < dateLock) {
    //         //             const time = await this.generalHandleService.convertMsToTime(dateLock - dateNow);
    //         //             const property = {
    //         //                 property: time
    //         //             }
    //         //             console.log(property, 'time')
    //         //             throw new HttpException([await this.customExceptionService.i18nErrorWithProperty(ERROR.COLLABORATOR.IS_LOCK_TIME, lang, property, null)], HttpStatus.NOT_FOUND);
    //         //         } else {
    //         //             getCollaborator.is_lock_time = false;
    //         //             getCollaborator.lock_time = null;
    //         //             getCollaborator.save();
    //         //         }
    //         //     }
    //         //     let collaboratorFee = 0;
    //         //     const getItem = await this.orderModel.findById(idOrder).populate({ path: 'id_customer', select: { avatar: 1, name: 1, code_phone_area: 1, phone: 1 } })
    //         //     if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "order")], HttpStatus.NOT_FOUND);
    //         //     const getGroupOrder = await this.groupOrderModel.findById(getItem.id_group_order);
    //         //     if (!getGroupOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "group_order")], HttpStatus.NOT_FOUND);
    //         //     if (getItem.status === "cancel") throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_CANCELED, lang, null)], HttpStatus.NOT_FOUND);
    //         //     if (getItem.status === "confirm") throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_CONFIRMED, lang, null)], HttpStatus.NOT_FOUND);
    //         //     const getService = await this.serviceModel.findById(getGroupOrder.service["_id"]);
    //         //     if (!getService) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "service")], HttpStatus.NOT_FOUND);
    //         //     if (new Date(getItem.date_work).getTime() - dateNow < 30 * 60000) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_OUTDATED, lang, null)], HttpStatus.NOT_FOUND);
    //         //     ///////////////////////////////////////// check xem co trung gio khong ///////////////////////////////////////////////
    //         //     const checkTimeStart = sub(new Date(getItem.date_work), { minutes: 30 }).toISOString();
    //         //     const checkTimeEnd = add(new Date(getItem.end_date_work), { minutes: 30 }).toISOString();
    //         //     const queryOrder = {
    //         //         $and: [
    //         //             { id_collaborator: getCollaborator._id },
    //         //             { status: { $in: ['confirm', 'doing'] } },
    //         //             {
    //         //                 $or: [
    //         //                     { date_work: { $gt: checkTimeStart, $lt: checkTimeEnd } },
    //         //                     { end_date_work: { $gt: checkTimeStart, $lt: checkTimeEnd } },
    //         //                 ]
    //         //             }
    //         //         ]
    //         //     }
    //         //     const getOrder = await this.orderModel.find(queryOrder);
    //         //     if (getOrder.length > 0) throw new HttpException([await this.customExceptionService.i18nError(ERROR.TIME_OVERLAP, lang, null)], HttpStatus.NOT_FOUND);
    //         //     // tinh phi tru nen tang
    //         //     let tempRemainder = 0;
    //         //     let platformFee = 0;
    //         //     tempRemainder = getCollaborator.gift_remainder - getGroupOrder.temp_platform_fee;
    //         //     if (getGroupOrder.payment_method === "cash") {
    //         //         tempRemainder = tempRemainder - getGroupOrder.temp_pending_money;
    //         //     }
    //         //     if (tempRemainder < 0) {
    //         //         const tempRemainderAbs = Math.abs(tempRemainder);
    //         //         if (getCollaborator.remainder < tempRemainderAbs) throw new HttpException([await this.customExceptionService.i18nError(ERROR.COLLABORATOR_NOT_ENOUGH_REMAINDER, lang, null)], HttpStatus.NOT_FOUND);
    //         //         getCollaborator.remainder = getCollaborator.remainder - tempRemainderAbs;
    //         //         getCollaborator.gift_remainder = 0;
    //         //     } else {
    //         //         getCollaborator.gift_remainder = tempRemainder;
    //         //     }
    //         //     if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
    //         //     getItem.status = "confirm"
    //         //     if (getGroupOrder.type === "schedule") {
    //         //         const query = {
    //         //             $and: [
    //         //                 { id_group_order: getGroupOrder._id },
    //         //                 { status: { $ne: "done" } },
    //         //                 { status: { $ne: "cancel" } }
    //         //             ]
    //         //         }
    //         //         const getAllOrder = await this.orderModel.find(query);
    //         //         for (const item of getAllOrder) {
    //         //             item.status = "confirm";
    //         //             item.id_collaborator = getCollaborator._id;
    //         //             item.phone_collaborator = getCollaborator.phone;
    //         //             // item.name_collaborator = findCollaborator.name;
    //         //             item.name_collaborator = getCollaborator.full_name;
    //         //             item.save();
    //         //         }
    //         //     }
    //         //     getGroupOrder.id_collaborator = getCollaborator._id
    //         //     getItem.id_collaborator = getCollaborator._id
    //         //     getItem.phone_collaborator = getCollaborator.phone;
    //         //     // getItem.name_collaborator = findCollaborator.name;
    //         //     getItem.name_collaborator = getCollaborator.full_name;
    //         //     const result = await getItem.save();
    //         //     await getCollaborator.save();
    //         //     await getGroupOrder.save();
    //         //     // this.activityCollaboratorSystemService.minusPlatformFee(getCollaborator, getGroupOrder.temp_platform_fee, getItem, getService)
    //         //     this.activityAdminSystemService.adminAddCollaboratorToOrder(idAdmin, getItem._id,getCollaborator._id)
    //         //     if (getGroupOrder.type === "schedule") {
    //         //         this.activityCollaboratorSystemService.minusPlatformFee(getCollaborator, getGroupOrder.temp_platform_fee, getItem, getService)
    //         //     } else {
    //         //         this.activityCollaboratorSystemService.minusPlatformFee(getCollaborator, getItem.platform_fee, getItem, getService)
    //         //     }
    //         //     if (getGroupOrder.temp_pending_money > 0) {
    //         //         this.activityCollaboratorSystemService.custodyCollaboratorFee(getCollaborator, getGroupOrder.temp_pending_money, getItem, getService)
    //         //     }
    //         //     return result;

    //         // } else if (payload.status === 'doing') {
    //         //     if (item.status === "cancel") throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_CANCELED, lang, null)], HttpStatus.NOT_FOUND);
    //         //     const dateWork = new Date(item.date_work).getTime();
    //         //     const dateNow = new Date(Date.now()).getTime();
    //         //     // if ((dateWork - dateNow) > 900000) throw new HttpException([await this.customExceptionService.i18nError(ERROR.COLLABORATOR.NOT_YET_TIME_WORK, lang, null)], HttpStatus.NOT_FOUND);
    //         //     item.status = "doing"
    //         //     item.id_collaborator = getCollaborator._id;
    //         //     const result = await item.save();
    //         //     this.activityAdminSystemService.adminChangeStatusOrderToDoing(idAdmin,item._id,getCollaborator._id)
    //         //     return result;
    //         // } else if (payload.status === 'done') {
    //         //     try {
    //         //         let collaboratorFee = 0;
    //         //         if (!item) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
    //         //         item.status = "done"
    //         //         item.id_collaborator = getCollaborator._id
    //         //         const getGroupOrder = await this.groupOrderModel.findById(item.id_group_order);
    //         //         if (!getGroupOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
    //         //         const getService = await this.serviceModel.findById(getGroupOrder.service["_id"])
    //         //         if (getGroupOrder.type === 'loop' && getGroupOrder.is_auto_order === true) {
    //         //             const currentDate = new Date(item.date_work).getTime();
    //         //             const newDateSchedule = {
    //         //                 date: new Date(currentDate + 7 * 24 * 60 * 60 * 1000).toISOString(),
    //         //                 status: "pending",
    //         //                 initial_fee: 0,
    //         //                 net_income_collaborator: 0,
    //         //                 platform_fee: 0
    //         //             }
    //         //             getGroupOrder.date_work_schedule.push(newDateSchedule);
    //         //             await getGroupOrder.save();
    //         //             await this.orderSystemService.processLoopOrder(item.id_group_order)
    //         //         }
    //         //         else if (getGroupOrder.type === "schedule") {
    //         //             item.is_duplicate = true;
    //         //             const index = getGroupOrder.date_work_schedule.findIndex(x => x.date === item.date_work);
    //         //             item.save();
    //         //             if (index + 1 < getGroupOrder.date_work_schedule.length) {
    //         //                 console.log(getGroupOrder.date_work_schedule[index + 1].date, 'getGroupOrder.date_work_schedule[index].date')
    //         //                 const getNextOrder = await this.orderModel.findOne({ id_group_order: getGroupOrder._id, date_work: getGroupOrder.date_work_schedule[index + 1].date })
    //         //                 if (getNextOrder) getNextOrder.is_duplicate = false;
    //         //                 console.log(getNextOrder, 'getNextOrder')
    //         //                 await getNextOrder.save();
    //         //             } else {
    //         //                 getGroupOrder.status = "done";
    //         //             }
    //         //         } else {
    //         //             getGroupOrder.status = "done";
    //         //         }


    //         //         if (item.payment_method === "cash") {
    //         //             getCollaborator.remainder += item.refund_money;
    //         //         } else {
    //         //             getCollaborator.remainder += item.net_income_collaborator + item.platform_fee;
    //         //         }

    //         //         getGroupOrder.temp_net_income_collaborator = getGroupOrder.temp_net_income_collaborator - item.net_income_collaborator;
    //         //         getGroupOrder.temp_pending_money = getGroupOrder.temp_pending_money - item.pending_money;
    //         //         getGroupOrder.temp_refund_money = getGroupOrder.temp_refund_money - item.refund_money;
    //         //         getGroupOrder.temp_initial_fee = getGroupOrder.temp_initial_fee - item.initial_fee;
    //         //         getGroupOrder.temp_final_fee = getGroupOrder.temp_final_fee - item.final_fee;
    //         //         getGroupOrder.temp_platform_fee = getGroupOrder.temp_platform_fee - item.platform_fee;


    //         //         await getCollaborator.save();
    //         //         await getGroupOrder.save();
    //         //         const result = await item.save();

    //         //         // tich diem thuoc khach hang, khong can phai await
    //         //         this.orderSystemService.calculateAccumulatePoints(item._id);
    //         //         this.activityCollaboratorSystemService.doneOrder(getCollaborator._id, idOrder)
    //         //         if (item.refund_money > 0 && item.payment_method === "cash") {
    //         //             this.activityCollaboratorSystemService.receiveCollaboratorFee(getCollaborator, item.refund_money, item, getService)
    //         //         }
    //         //         return result;
    //         //     } catch (err) {
    //         //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //         //     }
    //         // } else {
    //         //     throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
    //         // }
    //         // await item.save();
    //         return true;
    //     } catch (err) {
    //         throw new HttpException(error.response || [{ message: error.toString(), field: null }], HttpStatus.BAD_REQUEST);
    //     }
    // }

    async getOrderByCustomer(lang, iPage: iPageDTO, idCustomer, admin: UserSystemDocument) {
        try {
            const getCustomer = await this.customerRepositoryService.findOneById(idCustomer);
            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, "customer")], HttpStatus.BAD_REQUEST);
            // const checkPermisstion = await this.globalService.checkPermissionArea(admin, getCustomer.city);
            // if (!checkPermisstion.permisstion) {
            //     throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            // }
            let query;
            if (iPage.valueSort === 'all') {
                query = {
                    $and: [
                        { is_delete: false },
                        { id_customer: idCustomer }
                    ]
                }
            } else {
                query = {
                    $and: [
                        { is_delete: false },
                        { id_customer: idCustomer },
                        { status: iPage.valueSort }
                    ]
                }
            }
            const arrOrder = await this.groupOrderModel.find(query)
                .populate({
                    path: 'service', select: { _id: 1 }, populate: {
                        path: '_id', select: { kind: 1 }
                    }
                })
                .skip(iPage.start)
                .limit(iPage.length)
                .sort({ date_create: -1 })
                .then();
            const count = await this.groupOrderModel.count(query);

            const totalMoney = await this.groupOrderModel.aggregate([
                {
                    $match: {
                        $and: [
                            { is_delete: false },
                            { status: { $in: ["done", "confirm", "doing"] } },
                            { id_customer: getCustomer._id }
                        ]
                    }
                },
                {
                    $group: {
                        _id: "",
                        total: { $sum: "$final_fee" }
                    }
                }
            ])
            console.log('total ', totalMoney);

            const payload = {
                start: iPage.start,
                length: iPage.length,
                totalItem: count,
                data: arrOrder,
                totalMoney: totalMoney.length > 0 ? totalMoney[0].total : 0
            }
            return payload;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    async changeStatusOrder(lang, subjectAction, idOrder, payload: changeStatusOrderDTOAdmin, admin: UserSystemDocument, idCancel?) {
        try {
            // const getOrder = await this.orderModel.findById(idOrder);
            const getOrder = await this.orderRepositoryService.findOneById(idOrder);

            console.log("check");
            
            if (!getOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            if (getOrder.status === 'cancel') throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_CANCELED, lang, null)], HttpStatus.BAD_REQUEST);
            if (getOrder.status === 'done') throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_DONE, lang, null)], HttpStatus.BAD_REQUEST);
            if (getOrder.status === 'pending' && payload.status !== 'cancel') throw new HttpException([await this.customExceptionService.i18nError(ERROR.DO_NOT_CHANGE_STATUS, lang, null)], HttpStatus.BAD_REQUEST);
            console.log("check");

            // const checkPermisstion = await this.globalService.checkPermissionArea(admin, getOrder.city);
            // if (!checkPermisstion.permisstion) {
            //     throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            // }
            console.log("check");

            // console.log(admin, 'admin');
            

            const getCustomer = await this.customerRepositoryService.findOneById(getOrder.id_customer.toString());
            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            let getCollaborator = null;
            const getGroupOrder = await this.groupOrderModel.findById(getOrder.id_group_order);
            if (!getGroupOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            const getService = await this.serviceModel.findById(getGroupOrder.service["_id"])
            if (!getService) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            if (getOrder.id_collaborator) {
                getCollaborator = await this.collaboratorRepositoryService.findOneById(getOrder.id_collaborator.toString());
            }
            console.log("check");

            if (payload.status === 'cancel' && idCancel !== null && idCancel !== '') {
                console.log("in");
                
                await this.cancelOrder(lang, admin, idOrder, idCancel)
            } else if (payload.status === 'next') {
                if (getOrder.status === 'confirm') {
                    await this.orderSystemService.orderConfirmToDoing(lang, idOrder, getCollaborator, subjectAction, admin)
                } else if (getOrder.status === 'doing') {
                    const result = await this.orderSystemService.orderDoingToDone(lang, idOrder, getCollaborator, subjectAction, admin);
                    if (result.groupOrder.type === "loop" && result.groupOrder.is_auto_order === true) {
                        await this.groupOrderSystemService.createLoopGroupOrder(lang, result.groupOrder);
                    }
                }
            }
            // await getCustomer.save();
            // await getGroupOrder.save();
            // await getOrder.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);;
        }
    }

    async addCollaborator(lang, payload: addCollaboratorDTOAdmin, idOrder, admin: UserSystemDocument, subjectAction) {
        try {
            const getOrder = await this.orderModel.findById(idOrder);
            if (!getOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            // const checkPermisstion = await this.globalService.checkPermissionArea(admin, getOrder.city);
            // if (!checkPermisstion.permisstion) {
            //     throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            // }
            const getCustomer = await this.customerRepositoryService.findOneById(getOrder.id_customer.toString());
            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(payload.id_collaborator);
            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            const getGroupOrder = await this.groupOrderModel.findById(getOrder.id_group_order);
            if (!getGroupOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            const getService = await this.serviceModel.findById(getGroupOrder.service["_id"]);
            if (!getService) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "service")], HttpStatus.NOT_FOUND);
            await this.orderSystemService.checkStatusOrder(getOrder, ['cancel', 'doing', 'done', 'confirm'], lang)
            if (getOrder.status === 'pending') {
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
                        await this.collaboratorRepositoryService.findByIdAndUpdate(payload.id_collaborator, getCollaborator);
                    }
                }
                const result = await this.orderSystemService.orderPendingToConfirm(lang, idOrder, getCollaborator, subjectAction, admin, '1.0.0', payload.check_time);
            }
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);;
        }
    }

    // async addCollaborator(lang, payload: addCollaboratorDTOAdmin, idOrder, idAdmin) {
    //     try {
    //         const getOrder = await this.orderModel.findById(idOrder);
    //         if (!getOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
    //         const getCustomer = await this.customerModel.findById(getOrder.id_customer);
    //         if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
    //         const getCollaborator = await this.collaboratorModel.findById(payload.id_collaborator);
    //         if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
    //         const getGroupOrder = await this.groupOrderModel.findById(getOrder.id_group_order);
    //         if (!getGroupOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
    //         const getService = await this.serviceModel.findById(getGroupOrder.service["_id"]);
    //         if (!getService) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "service")], HttpStatus.NOT_FOUND);
    //         if (getOrder.status === 'doing' || getOrder.status === 'done' || getOrder.status === 'cancel' || getOrder.status === 'confirm') { throw new HttpException([await this.customExceptionService.i18nError(ERROR.DONT_ADD_COLLABORATOR, lang, null)], HttpStatus.BAD_REQUEST); }
    //         if (getOrder.status === 'pending') {
    //             if (getCollaborator.is_lock_time === true) {
    //                 const dateNow = new Date(Date.now()).getTime();
    //                 const dateLock = new Date(getCollaborator.lock_time).getTime();
    //                 if (dateNow < dateLock) {
    //                     const time = await this.generalHandleService.convertMsToTime(dateLock - dateNow);
    //                     const property = {
    //                         property: time
    //                     }
    //                     throw new HttpException([await this.customExceptionService.i18nErrorWithProperty(ERROR.COLLABORATOR.IS_LOCK_TIME, lang, property, null)], HttpStatus.NOT_FOUND);
    //                 } else {
    //                     getCollaborator.is_lock_time = false;
    //                     getCollaborator.lock_time = null;
    //                     getCollaborator.save();
    //                 }
    //             }
    //             const checkTimeStart = sub(new Date(getOrder.date_work), { minutes: 30 }).toISOString();
    //             const checkTimeEnd = add(new Date(getOrder.end_date_work), { minutes: 30 }).toISOString();
    //             const queryOrder = {
    //                 $and: [
    //                     { id_collaborator: getCollaborator._id },
    //                     { status: { $in: ['confirm', 'doing'] } },
    //                     {
    //                         $or: [
    //                             { date_work: { $gt: checkTimeStart, $lt: checkTimeEnd } },
    //                             { end_date_work: { $gt: checkTimeStart, $lt: checkTimeEnd } },
    //                         ]
    //                     }
    //                 ]
    //             }
    //             const getOrderOverlap = await this.orderModel.find(queryOrder);
    //             if (getOrderOverlap.length > 0) throw new HttpException([await this.customExceptionService.i18nError(ERROR.TIME_OVERLAP, lang, null)], HttpStatus.BAD_REQUEST);
    //             if (getGroupOrder.type === 'schedule') throw new HttpException([await this.customExceptionService.i18nError(ERROR.DONT_ADD_COLLABORATOR, lang, null)], HttpStatus.BAD_REQUEST);
    //             let tempRemainder = 0;
    //             tempRemainder = getCollaborator.gift_remainder - getGroupOrder.temp_platform_fee;
    //             if (getGroupOrder.payment_method === "cash") {
    //                 tempRemainder = tempRemainder - getGroupOrder.temp_pending_money;
    //             }
    //             if (tempRemainder < 0) {
    //                 const tempRemainderAbs = Math.abs(tempRemainder);
    //                 if (getCollaborator.remainder < tempRemainderAbs) throw new HttpException([await this.customExceptionService.i18nError(ERROR.COLLABORATOR_NOT_ENOUGH_REMAINDER, lang, null)], HttpStatus.NOT_FOUND);
    //                 getCollaborator.remainder = getCollaborator.remainder - tempRemainderAbs;
    //                 getCollaborator.gift_remainder = 0;
    //             } else {
    //                 getCollaborator.gift_remainder = tempRemainder;
    //             }
    //             getOrder.status = "confirm";
    //             getGroupOrder.status = "confirm";
    //             if (getGroupOrder.type === 'loop' && getGroupOrder.is_auto_order) {
    //                 for (let i of getGroupOrder.date_work_schedule) {
    //                     if (i.status === 'pending') {
    //                         i.status = 'confirm';
    //                         break;
    //                     }
    //                 }
    //             } else {
    //                 for (let i of getGroupOrder.date_work_schedule) {
    //                     i.status = 'confirm';
    //                 }
    //             }
    //             getGroupOrder.id_collaborator = getCollaborator._id;
    //             getOrder.id_collaborator = getCollaborator._id;
    //             getOrder.phone_collaborator = getCollaborator.phone;
    //             getOrder.name_collaborator = getCollaborator.full_name;
    //             await getOrder.save();
    //             await getCollaborator.save();
    //             await getGroupOrder.save();
    //             this.activityCollaboratorSystemService.confirmOrder(getCollaborator._id, getOrder._id)

    //             let tempPlatformFee = getOrder.platform_fee;
    //             if (getGroupOrder.temp_pending_money > 0) {
    //                 tempPlatformFee += getGroupOrder.temp_pending_money;
    //             }
    //             await this.activityCollaboratorSystemService.minusPlatformFee(getCollaborator, tempPlatformFee, getOrder, getService)
    //         }
    //         return true;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);;
    //     }
    // }

    async getOrderByGroupOrder(lang, idGroupOrder) {
        try {
            const getGroupOrder = await this.groupOrderModel.findById(idGroupOrder)
                .populate({ path: 'id_customer', select: { avatar: 1, full_name: 1, name: 1, code_phone_area: 1, phone: 1, gender: 1, birthday: 1 } })
                .populate({ path: 'id_collaborator', select: { avatar: 1, name: 1, full_name: 1, code_phone_area: 1, phone: 1, gender: 1 } })



            if (!getGroupOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);

            const query = {
                $and: [
                    { id_group_order: getGroupOrder._id, },
                ]
            }
            const getOrder = await this.orderModel.find(query)
                .sort({ date_work: 1, ordinal_number: 1 });
            const count = await this.orderModel.count(query);
            return {
                totalItem: count,
                data: {
                    listOrder: getOrder,
                    groupOrder: getGroupOrder
                }
            }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);;
        }
    }

    async getOrderByGroupOrderV2(lang, iPage: iPageDTO, idGroupOrder, admin: UserSystemDocument) {
        try {
            const getGroupOrder = await this.groupOrderRepositoryService.findOneById(idGroupOrder, {}, [
                { path: "id_customer", select: { full_name: 1, _id: 1, phone: 1, avatar: 1, id_block_collaborator: 1, id_favourite_collaborator: 1 } },
                { path: "id_collaborator", select: { full_name: 1, _id: 1, phone: 1, avatar: 1, star: 1 } },
                { path: 'code_promotion._id', select: { title: 1 } },
                { path: 'event_promotion._id', select: { title: 1 } }
            ])


            if (!getGroupOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            const query = {
                $and: [
                    { id_group_order: getGroupOrder._id, },
                ]
            }
            const getOrder = await this.orderRepositoryService.getListPaginationDataByCondition(iPage, query, {}, { date_work: 1 }, [
                { path: "id_customer", select: { full_name: 1, _id: 1, phone: 1, avatar: 1, id_block_collaborator: 1, id_favourite_collaborator: 1 } },
                { path: "id_collaborator", select: { full_name: 1, _id: 1, phone: 1, avatar: 1 } },
            ])
            const count = await this.orderModel.count(query);

            return {
                totalItem: count,
                data: {
                    listOrder: getOrder,
                    groupOrder: getGroupOrder
                }
            }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);;
        }
    }

    async changeStatusOrderV2(lang, idOrder, idAdmin) {
        try {
            const getOrder = await this.orderModel.findById(idOrder);
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);;
        }
    }

    async editDateWork(lang, idOrder, payload: editOrderV2DTOAdmin, admin: UserSystemDocument) {
        try {
            if (payload.is_change_price) { // không hoạt động với ca cố định
                const getOrder = await this.orderModel.findById(idOrder);
                await this.groupOrderSystemService.editGroupOrder(lang, getOrder.id_group_order, payload, admin)
            } else {
                await this.orderSystemService.editOrderNoChangePrice(lang, idOrder, payload, admin)
            }
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);;
        }
    }

    async test() {
        try {
            const currentDate = new Date(Date.now());
            const getCollaboratorSetting = await this.collaboratorSettingModel.findOne()
            const timePushNoti = getCollaboratorSetting.time_push_noti_collaborator ? getCollaboratorSetting.time_push_noti_collaborator : 3;
            console.log('time push noti', timePushNoti);

            const getGroupOrder = await this.groupOrderModel.aggregate([
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
                    $match: {
                        $and: [
                            {
                                $expr: {
                                    $eq:
                                        ["$timeDifferent", timePushNoti]
                                }
                            },
                            {
                                status: 'pending',
                            },
                            // { id_favourite_collaborator: { $size: 0 } }
                        ]

                    }
                }
            ]);
            return {
                totalItem: getGroupOrder.length,
                data: getGroupOrder
            }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);;
        }
    }
    ////
    async adminCheckReview(lang, idOrder, payload: adminCheckReviewDTOAdmin, admin: UserSystemDocument) {
        try {
            const getOrder = await this.orderModel.findById(idOrder);
            if (!getOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, 'order')], HttpStatus.BAD_REQUEST);
            const checkPermisstion = await this.globalService.checkPermissionArea(admin, getOrder.city);
            if (!checkPermisstion.permisstion) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            }
            getOrder.is_check_admin = true;
            getOrder.note_admin = payload.note_admin || '';
            getOrder.date_check_admin = new Date(Date.now()).toISOString();
            await getOrder.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);;
        }
    }

    async noteAdmin(lang, idOrder, payload: adminCheckReviewDTOAdmin, admin: UserSystemDocument) {
        try {
            const getOrder = await this.orderModel.findById(idOrder);
            if (!getOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, 'order')], HttpStatus.BAD_REQUEST);
            // const checkPermisstion = await this.globalService.checkPermissionArea(admin, getOrder.city);
            // if (!checkPermisstion.permisstion) {
            //     throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_PERMISSION, lang, "admin")], HttpStatus.BAD_REQUEST);
            // }
            getOrder.note_admin = payload.note_admin !== '' ? payload.note_admin : getOrder.note_admin;
            await getOrder.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);;
        }
    }

    ////////////////////////////////////////////
    async processRemindPunishJobForCollaborator() {
        try {
            const iPageOrder = {
                search: "",
                start: 0,
                length: 100,
            }
            const queryOrder = {
                $and: [
                    { status: "confirm" }
                ]
            }
            const arrOrder = await this.orderModel.find(queryOrder)
                .skip(iPageOrder.start)
                .limit(iPageOrder.length);
            const dateNow = new Date();
            for (const order of arrOrder) {
                const different_time = differenceInMinutes(dateNow, new Date(order.date_work));
                if (different_time > 15) {
                    const query = {
                        $and: [
                            { is_delete: false },
                            { id_order: order._id },
                            { id_collaborator: order.id_collaborator },
                            { note_admin: "Phạt tiền bắt đầu ca trễ lần 1" }
                        ]
                    }
                    const check = await this.punishModel.count(query);
                    console.log('check ', check, ' === ', order._id, '--- ', check < 1);

                    if (check < 1) {
                        const arrDeviceToken = await this.deviceTokenModel.find({ user_id: order.id_collaborator, user_object: "collaborator" })
                        const description = {
                            vi: `Bạn đã không b._idắt đầu công việc sau 15 phút`,
                            en: `You didn't start work after 15 minutes`
                        }
                        const title = {
                            vi: `Bạn đã không bắt đầu công việc lần 1`,
                            en: `You didn't start your first times`
                        }
                        const payloadNotification = {
                            title: title,
                            description: description,
                            user_object: "collaborator",
                            id_collaborator: order.id_collaborator.toString(),
                            type_notification: "system",
                            related_id: null
                        }
                        await this.notificationSystemService.newActivity(payloadNotification);
                        if (arrDeviceToken.length > 0) {
                            const playload = {
                                title: "Bạn đã không bắt đầu công việc lần 1",
                                body: "Bạn đã không bắt đầu công việc sau 15 phút",
                                token: [arrDeviceToken[0].token]
                            }
                            for (let i = 1; i < arrDeviceToken.length; i++) {
                                playload.token.push(arrDeviceToken[i].token)
                            }
                            this.notificationService.send(playload)
                        }
                        const payload: PunishCollaboratorDTOAdmin = {
                            money: 15000,
                            punish_note: "Phạt tiền bắt đầu ca trễ lần 1",
                            id_order: order._id,
                            id_punish: "6461b39fc3993c7752770ef1"
                        }
                        console.log(' ===== ', order._id, '    <<< ', check);
                        await this.punishManagerService.systemMonetaryFineCollaborator("vi", order.id_collaborator, payload);

                    }
                }

                if (different_time > 30) {
                    const query = {
                        $and: [
                            { is_delete: false },
                            { id_order: order._id },
                            { id_collaborator: order.id_collaborator },
                            { note_admin: "Phạt tiền bắt đầu ca trễ lần 2" }
                        ]
                    }
                    const check = await this.punishModel.count(query);
                    if (check < 1) {
                        const arrDeviceToken = await this.deviceTokenModel.find({ user_id: order.id_collaborator, user_object: "collaborator" })
                        const description = {
                            vi: `Bạn đã không bắt đầu công việc sau 30 phút`,
                            en: `You didn't start work after 30 minutes`
                        }
                        const title = {
                            vi: `Bạn đã không bắt đầu công việc lần 2`,
                            en: `You didn't start your second times`
                        }
                        const payloadNotification = {
                            title: title,
                            description: description,
                            user_object: "collaborator",
                            id_collaborator: order.id_collaborator.toString(),
                            type_notification: "system",
                            related_id: null
                        }
                        await this.notificationSystemService.newActivity(payloadNotification);
                        if (arrDeviceToken.length > 0) {
                            const playload = {
                                title: "Bạn đã không bắt đầu công việc lần 2",
                                body: "Bạn đã không bắt đầu công việc sau 30 phút",
                                token: [arrDeviceToken[0].token]
                            }
                            for (let i = 1; i < arrDeviceToken.length; i++) {
                                playload.token.push(arrDeviceToken[i].token)
                            }
                            this.notificationService.send(playload)
                        }
                        const payload: PunishCollaboratorDTOAdmin = {
                            money: 50000,
                            punish_note: "Phạt tiền bắt đầu ca trễ lần 2",
                            id_order: order._id,
                            id_punish: "6461b39fc3993c7752770ef1"
                        }
                        await this.punishManagerService.systemMonetaryFineCollaborator("vi", order.id_collaborator, payload);
                    }
                }
            }
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }
    ////////////////////////////////////////////////////////////////
    async changeCollaboratorV2(lang, idOrder: string, admin) {
        try {
            const getOrder = await this.orderModel.findById(idOrder)
            if (!getOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, ' order')], HttpStatus.BAD_REQUEST);
            const getGroupOrder = await this.groupOrderModel.findById(getOrder.id_group_order);
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
                    { id_group_order: getOrder.id_group_order },
                    { status: "confirm" }
                ]
            }
            const getArrOrder = await this.orderModel.find(query).sort({ date_work: 1 });
            getGroupOrder.id_collaborator = null;
            getGroupOrder.name_collaborator = null;
            getGroupOrder.phone_collaborator = null;
            getGroupOrder.status = 'pending';
            await getGroupOrder.save();
            let temp_platform_fee = getArrOrder[0].platform_fee;
            let temp_pending_money = getArrOrder[0].pending_money;
            for (let i = 0; i < getArrOrder.length; i++) {
                getArrOrder[i].id_collaborator = null;
                getArrOrder[i].name_collaborator = null;
                getArrOrder[i].phone_collaborator = null;
                getArrOrder[i].status = 'pending';
                await getArrOrder[i].save();
            }
            const previousBalance: previousBalanceCollaboratorDTO = {
                collaborator_wallet: getCollaborator.collaborator_wallet,
                work_wallet: getCollaborator.work_wallet
            }
            getCollaborator.work_wallet += temp_platform_fee + temp_pending_money;
            //await getCollaborator.save();
            await this.collaboratorRepositoryService.findByIdAndUpdate(getCollaborator._id, getCollaborator)
            await this.activityCollaboratorSystemService.refundPlatformMoney(getCollaborator, (temp_platform_fee + temp_pending_money), getGroupOrder, getService, getArrOrder[0], previousBalance);
            await this.activityAdminSystemService.adminChangeCollaborator(admin._id, getCollaborator._id, getGroupOrder._id);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    async searchOrder(lang, iPage: iPageSearchOrderDTO, admin: UserSystemDocument) {
        try {
            iPage.search = `#${iPage.search}`;
            const query: any = searchQuery(["id_view"], iPage);
            // const id_collaborator = await this.generalHandleService.convertObjectId(iPage.collaborator) 
            // if (iPage.collaborator && iPage.collaborator !== "") { 
            //     query.$and.push({ id_collaborator: id_collaborator });
            // }
            // const getOrder = await this.orderRepositoryService.getListPaginationDataByCondition(iPage, query, {}, { date_work: 1 }, [
            const result = await this.orderRepositoryService.getListPaginationDataByCondition(iPage, query, {}, {date_create: -1});
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    async updateProcessReviewOrder(lang, req: changeStatusHandleReviewOrder, admin: UserSystemDocument) {
        try {

            const findOrder = await this.orderModel.findById(req.id_order);
            if (!findOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, 'order')], HttpStatus.NOT_FOUND);
            const newObject = {
                id_user_system_handle_review: admin._id,
                status_handle_review: (req.status_handle_review) ? req.status_handle_review : findOrder.status_handle_review,
                note_admin: (req.note_admin) ? req.note_admin : findOrder.note_admin,
                date_create: new Date(Date.now()).toISOString()
            }
            console.log(newObject, 'newObject');

            findOrder.note_admin = newObject.note_admin;
            findOrder.status_handle_review = newObject.status_handle_review;
            findOrder.id_user_system_handle_review = newObject.id_user_system_handle_review;
            findOrder.history_user_system_handle_review.unshift(newObject);
            const result = await findOrder.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getTotalOrder(lang, iPage: iPageTotalOrderDTOAdmin) {
        try {
            const result = {
                total: '',
                processing: 'processing',
                pending: 'pending',
                confirm: 'confirm',
                doing: 'doing',
                cancel: 'cancel',
                done: 'done',
            }

            for (const key in result) {
                const query: any = {
                    $and: [
                        { is_delete: false},
                        { is_active: true }, 
                        { is_duplicate: false }
                    ]
                }
                if (iPage.start_date && iPage.end_date) {
                    query.$and.push(
                        queryWithinRangeDate("date_create", iPage.start_date, iPage.end_date)
                    );
                }
                if (result[key] !== '') {
                    query.$and.push({ status: result[key] });
                }
                if (iPage.id_service !== 'all') {
                    query.$and.push({ 'service._id': iPage.id_service });
               }
                if (iPage.city) {
                    query.$and.push({ city: { $in: iPage.city } });
                }
                if (iPage.district) {
                    query.$and.push({ 'district': { $in: iPage.district } });
                } 
                if (iPage.payment_method !== "all") {
                    query.$and.push({ payment_method: iPage.payment_method });
               }
                const total = await this.orderRepositoryService.countDataByCondition(query);
                result[key] = total
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async cancelOrder(lang, user, idOrder, idCancel, ) {
        try {

            const stepCancel = {
                isCancel: true,
                isRefundCustomer: true,
                isRefundCollaborator: true,
                isPunishCollaborator: false,
                isPunishCustomer: false,
                isUnassignCollaborator: false,
                isMinusNextOrderCollaborator: true
            }
            // const subjectAction = user._id.toString()
            const subjectAction = {
                _id: user._id.toString(),
                type: "admin"
            }
            
            const result = await this.orderSystemService2.cancelOrder(lang, subjectAction, idOrder, idCancel, stepCancel)

            // const result = await this.coreSystemService.cancelOrder(lang, subjectAction, idOrder, idCancel, stepCancel)
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
