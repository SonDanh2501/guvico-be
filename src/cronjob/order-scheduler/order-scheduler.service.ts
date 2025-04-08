import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Cron, CronExpression } from '@nestjs/schedule'
import { Model } from 'mongoose'
import { Collaborator, CollaboratorDocument, Customer, CustomerDocument, DeviceToken, DeviceTokenDocument, ERROR, Order, OrderDocument } from 'src/@core'
import { CollaboratorSetting, CollaboratorSettingDocument } from 'src/@core/db/schema/collaborator_setting.schema'
import { GroupOrder, GroupOrderDocument } from 'src/@core/db/schema/group_order.schema'
import { Punish, PunishDocument } from 'src/@core/db/schema/punish.schema'
import { ReasonCancel, ReasonCancelDocument } from 'src/@core/db/schema/reason_cancel.schema'
import { createPunishTicketFromPolicyDTO } from 'src/@core/dto/punishTicket.dto'
import { createTransactionDTO } from 'src/@core/dto/transaction.dto'
import { PAYMENT_METHOD, STATUS_ORDER } from 'src/@repositories/module/mongodb/@database/enum'
import { CollaboratorRepositoryService } from 'src/@repositories/repository-service/collaborator-repository/collaborator-repository.service'
import { CustomerRepositoryService } from 'src/@repositories/repository-service/customer-repository/customer-repository.service'
import { OrderRepositoryService } from 'src/@repositories/repository-service/order-repository/order-repository.service'
import { PunishPolicyRepositoryService } from 'src/@repositories/repository-service/punish-policy-repository/punish-policy-repository.service'
import { PunishTicketRepositoryService } from 'src/@repositories/repository-service/punish-ticket-repository/punish-ticket-repository.service'
import { TransactionRepositoryService } from 'src/@repositories/repository-service/transaction-repository/transaction-repository.service'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service'
import { PunishManagerService } from 'src/admin/punish-manager/punish-manager.service'
import { CoreSystemService } from 'src/core-system/@core-system/core-system.service'
import { GroupOrderSystemService2 } from 'src/core-system/@core-system/group-order-system/group-order-system.service'
import { JobSystemService } from 'src/core-system/@core-system/job-system/job-system.service'
import { OrderSystemService2 } from 'src/core-system/@core-system/order-system/order-system.service'
import { ActivityCollaboratorSystemService } from 'src/core-system/activity-collaborator-system/activity-collaborator-system.service'
import { ActivityCustomerSystemService } from 'src/core-system/activity-customer-system/activity-customer-system.service'
import { ActivitySystemService } from 'src/core-system/activity-system/activity-system.service'
import { CollaboratorSystemService } from 'src/core-system/collaborator-system/collaborator-system.service'
import { InviteCodeSystemService } from 'src/core-system/invite-code-system/invite-code-system.service'
import { OrderSystemService } from 'src/core-system/order-system/order-system.service'
import { PunishTicketSystemService } from 'src/core-system/punish-ticket-system/punish-ticket-system.service'
import { PushNotiSystemService } from 'src/core-system/push-noti-system/push-noti-system.service'
import { TransactionSystemService } from 'src/core-system/transaction-system/transaction-system.service'
import { NotificationService } from 'src/notification/notification.service'
import { NotificationSystemService } from '../../core-system/notification-system/notification-system.service'

@Injectable()
export class OrderSchedulerService {
    constructor(
        private activitySystemService: ActivitySystemService,
        private notificationService: NotificationService,
        private orderSystemService: OrderSystemService,
        private generalHandleService: GeneralHandleService,
        private notificationSystemService: NotificationSystemService,
        private punishManagerService: PunishManagerService,
        private inviteCodeSystemService: InviteCodeSystemService,
        private pushNotiSystemService: PushNotiSystemService,
        private collaboratorSystemService: CollaboratorSystemService,
        private collaboratorRepositoryService: CollaboratorRepositoryService,
        private activityCustomerSystemService: ActivityCustomerSystemService,
        private orderRepositoryService: OrderRepositoryService,
        private punishTicketSystemService: PunishTicketSystemService,
        private punishPolicyRepositoryService: PunishPolicyRepositoryService,
        private punishTicketRepositoryService: PunishTicketRepositoryService,
        private customExceptionService: CustomExceptionService,
        private transactionSystemService: TransactionSystemService,
        private transactionRepositoryService: TransactionRepositoryService,
        private activityCollaboratorSystemService: ActivityCollaboratorSystemService,
        private customerRepositoryService: CustomerRepositoryService,

        private coreSystemService: CoreSystemService,
        private orderSystemService2: OrderSystemService2,
        private jobSystemService: JobSystemService,
        private groupOrderSystemService2: GroupOrderSystemService2,

        @InjectModel(Collaborator.name) private collaboratorModel: Model<CollaboratorDocument>,
        @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @InjectModel(GroupOrder.name) private groupOrderModel: Model<GroupOrderDocument>,
        @InjectModel(DeviceToken.name) private deviceTokenModel: Model<DeviceTokenDocument>,
        @InjectModel(ReasonCancel.name) private reasonCancelModel: Model<ReasonCancelDocument>,
        @InjectModel(CollaboratorSetting.name) private collaboratorSettingModel: Model<CollaboratorSettingDocument>,
        @InjectModel(Punish.name) private punishModel: Model<PunishDocument>,

    ) { }


    @Cron('15 * * * * *')
    async handleCron() {
        this.processRemindJobForCollaborator();
        this.cancelOrderOutDate();
        // this.cancelOrderConfirmOutDate();
        this.pushNotiOrderV2();
        // this.processRemindPunishJobForCollaborator(); // dong comment de test automation
        // this.processRemindPunishEndJobForCollaborator(); // chuyen qua automation
        this.processRemindCustomerOrderNotStart();
        this.cancelProcessingOrderAfter13Minutes();
        this.cancelProcessingOrderAfter15Minutes();
        // this.CollaboratorLate10Minutes();
        // console.log('hm,m,mm');

    }

    @Cron(CronExpression.EVERY_5_MINUTES)
    async runEvery5Minutes() {
        const subjectAction = {
            type: "system",
            _id: null
        }
        this.jobSystemService.removeDuplicateMinusPlatformFeeType("vi", subjectAction)
    }

    async processRemindJobForCollaborator() {
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
            const arrOrder = await this.orderModel.find(queryOrder).skip(iPageOrder.start).limit(iPageOrder.length);
            const dateNow = new Date(Date.now()).getTime();
            for (const item of arrOrder) {
                const dateWork = new Date(item.date_work).getTime();
                if (dateWork - dateNow < 1800000 && dateWork - dateNow > 1740000) {
                    const arrDeviceToken = await this.deviceTokenModel.find({ user_id: item.id_collaborator, user_object: "collaborator" })
                    if (arrDeviceToken.length > 0) {
                        const playload = {
                            title: "Sắp đến giờ làm việc tiếp theo",
                            body: "Bạn sắp có một công việc tiếp theo sau khoảng 30 phút nữa",
                            token: [arrDeviceToken[0].token]
                        }
                        for (let i = 1; i < arrDeviceToken.length; i++) {
                            playload.token.push(arrDeviceToken[i].token)
                        }
                        this.notificationService.send(playload)
                    }
                }
                if (dateWork - dateNow < 300000 && dateWork - dateNow > 240000) {
                    const arrDeviceToken = await this.deviceTokenModel.find({ user_id: item.id_collaborator, user_object: "collaborator" })
                    const description = {
                        vi: `Sắp đến giờ làm việc tiếp theo`,
                        en: `Sắp đến giờ làm việc tiếp theo`
                    }
                    const title = {
                        vi: `Bạn sắp có một công việc tiếp theo sau khoảng 5 phút nữa`,
                        en: `Bạn sắp có một công việc tiếp theo sau khoảng 5 phút nữa`
                    }
                    const payloadNotification = {
                        title: title,
                        description: description,
                        user_object: "collaborator",
                        id_collaborator: item.id_collaborator.toString(),
                        type_notification: "system",
                        related_id: null
                    }
                    await this.notificationSystemService.newActivity(payloadNotification);
                    if (arrDeviceToken.length > 0) {
                        const playload = {
                            title: "Chuẩn bị công việc",
                            body: "Bạn sắp có một công việc tiếp theo sau khoảng 5 phút nữa",
                            token: [arrDeviceToken[0].token]
                        }
                        for (let i = 1; i < arrDeviceToken.length; i++) {
                            playload.token.push(arrDeviceToken[i].token)
                        }
                        this.notificationService.send(playload)
                    }
                }
            }
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async cancelOrderOutDate() {
        try {

            const dateNow = new Date(Date.now()).getTime();
            // 15p gan toi thoi gian lam viec van k ai nhan thi tu dong huy
            const dateNow15MinutesAgo = new Date(dateNow + 900000).toISOString();
            console.log(dateNow15MinutesAgo, 'dateNow15MinutesAgo');
            
            const query = {
                $and: [
                    { date_work: { $lt: dateNow15MinutesAgo } },
                    {
                        $or: [
                            { status: "pending" }
                        ]
                    }
                ]
            }
            const arrOrder = await this.orderModel.find(query)
                .select({
                    id_customer: 1, id_group_order: 1, date_work: 1, status: 1, service_fee: 1, final_fee: 1, initial_fee: 1,
                    pending_money: 1, platform_fee: 1, net_income_collaborator: 1, refund_money: 1, payment_method: 1
                })

            const getReasonCancelOutDate = await this.reasonCancelModel.findOne({ apply_user: "system_out_date" })

            const stepCancel = {
                isCancel: true,
                isRefundCustomer: true,
                isRefundCollaborator: false,
                isPunishCollaborator: false,
                isPunishCustomer: false,
                isUnassignCollaborator: false,
                isMinusNextOrderCollaborator: false
            }
            const subjectAction = {
                _id: null,
                type: "system"
            }
            console.log(arrOrder.length, "arrOrder.length");
            
            for (let i = 0; i < arrOrder.length; i++) {
                await this.orderSystemService2.cancelOrder("vi", subjectAction, arrOrder[i]._id, getReasonCancelOutDate._id, stepCancel)
            }
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async cancelOrderOutDateBackup() {
        try {

            const dateNow = new Date(Date.now()).getTime();
            // 15p gan toi thoi gian lam viec van k ai nhan thi tu dong huy
            const dateNow15MinutesAgo = new Date(dateNow + 900000).toISOString();
            // const dateNow15MinutesAgo = new Date(dateNow + 1800000).toISOString();

            const query = {
                $and: [
                    { date_work: { $lt: dateNow15MinutesAgo } },
                    {
                        $or: [
                            { status: "pending" }
                        ]
                    }
                ]
            }
            const arrOrder = await this.orderModel.find(query)
                .select({
                    id_customer: 1, id_group_order: 1, date_work: 1, status: 1, service_fee: 1, final_fee: 1, initial_fee: 1,
                    pending_money: 1, platform_fee: 1, net_income_collaborator: 1, refund_money: 1, payment_method: 1
                })

            const getReasonCancelOutDate = await this.reasonCancelModel.findOne({ apply_user: "system_out_date" })



            for (let i = 0; i < arrOrder.length; i++) {
                let tempServiceFee = 0;

                const findGroupOrder = await this.groupOrderModel.findById(arrOrder[i].id_group_order);

                if (!findGroupOrder) continue;
                if (findGroupOrder.type === "schedule") {
                    const query = {
                        $and: [
                            { id_group_order: findGroupOrder._id },
                            {
                                $or: [
                                    { status: "pending" },
                                    { status: "confirm" }
                                ]
                            }
                        ]
                    }
                    const getOrderPendingConfirm = await this.orderModel.find(query)
                        .select({
                            platform_fee: 1, id_collaborator: 1, date_work: 1, service_fee: 1,
                            final_fee: 1, initial_fee: 1, status: 1, pending_money: 1, refund_money: 1,
                            is_duplicate: 1
                        })
                        .sort({ date_work: 1 })
                    const findIndexOrder = getOrderPendingConfirm.findIndex(x => x.date_work === arrOrder[i].date_work);


                    const findAnyOrderDone = await this.orderModel.findOne({
                        $and: [
                            { id_group_order: findGroupOrder._id },
                            { status: "done" },
                            { date_work: { $lt: arrOrder[i].date_work } }
                        ]
                    })





                    const findOrderDateWorkNext = await this.orderModel.findOne({
                        $and: [
                            { id_group_order: findGroupOrder._id },
                            {
                                $or: [
                                    { status: "confirm" },
                                    { status: "pending" }
                                ]
                            },
                            { date_work: { $gt: arrOrder[i].date_work } },
                            // {ordinal_number: arrOrder[i].ordinal_number + 1}
                        ]
                    }).sort({ date_work: 1 })
                    if (findOrderDateWorkNext) {
                        findOrderDateWorkNext.is_duplicate = false;
                        arrOrder[i].is_duplicate = true;

                        if (!findAnyOrderDone) {
                            // let fee_service = 0;
                            for (const itemOrder of arrOrder[i].service_fee) {
                                tempServiceFee += itemOrder["fee"];
                            }
                            const temp_service_fee = arrOrder[i].service_fee;
                            const temp_pending_money = arrOrder[i].pending_money;
                            arrOrder[i].service_fee = [];
                            arrOrder[i].pending_money = 0;
                            arrOrder[i].final_fee -= tempServiceFee;
                            findOrderDateWorkNext.service_fee = temp_service_fee;
                            findOrderDateWorkNext.pending_money = temp_pending_money;
                            findOrderDateWorkNext.final_fee += tempServiceFee;
                        }
                        await findOrderDateWorkNext.save();
                    } else {
                        if (findAnyOrderDone) {
                            findGroupOrder.status = "done"
                        } else {
                            findGroupOrder.status = "cancel"
                        }
                    }
                } else {
                    findGroupOrder.status = "cancel";
                }
                findGroupOrder.temp_net_income_collaborator = findGroupOrder.temp_net_income_collaborator - arrOrder[i].net_income_collaborator;
                findGroupOrder.temp_pending_money = findGroupOrder.temp_pending_money - arrOrder[i].pending_money;
                findGroupOrder.temp_refund_money = findGroupOrder.temp_refund_money - arrOrder[i].refund_money;
                findGroupOrder.temp_initial_fee = findGroupOrder.temp_initial_fee - arrOrder[i].initial_fee;
                findGroupOrder.temp_final_fee = findGroupOrder.temp_final_fee - arrOrder[i].final_fee;
                findGroupOrder.temp_platform_fee = findGroupOrder.temp_platform_fee - arrOrder[i].platform_fee;
                if (findGroupOrder.status === "cancel") findGroupOrder.id_cancel_system = {
                    id_reason_cancel: getReasonCancelOutDate._id,
                    date_create: new Date(Date.now()).toISOString()
                };
                await findGroupOrder.save();
                const getCustomer = await this.customerRepositoryService.findOneById(arrOrder[i].id_customer.toString());
                if (getCustomer) {
                    if (arrOrder[i].payment_method === "point") {
                        // getCustomer.pay_point += arrOrder[i].final_fee + tempServiceFee;
                        // this.activityCustomerSystemService.refundPayPointV2(getCustomer._id, arrOrder[i].final_fee + tempServiceFee, findGroupOrder, arrOrder[i])

                        const _transfer_note = await this.transactionSystemService.generateRandomTransferNoteCustomer(getCustomer);
                        const payload_transaction: createTransactionDTO = {
                            id_customer: getCustomer._id.toString(),
                            money: Number(arrOrder[i].final_fee + tempServiceFee),
                            status: 'pending',
                            subject: 'customer',
                            type_transfer: 'refund_service',
                            transfer_note: _transfer_note,
                            payment_in: "pay_point",
                            payment_out: "cash_book",
                            id_order: arrOrder[i]._id,
                        }
                        const transaction = await this.transactionSystemService.createItem(payload_transaction);
                        await this.activitySystemService.createTransaction(transaction);
                        const resultTransaction = await this.transactionSystemService.verifyTransaction('vi', transaction._id,)
                        await this.activitySystemService.verifyTransactionRefundPaymentService(transaction, resultTransaction.customer, null, arrOrder[i]);

                    }
                    // await this.customerRepositoryService.findByIdAndUpdate(getCustomer._id, getCustomer);
                    this.activitySystemService.cancelOrderBySystem(getCustomer._id, arrOrder[i]._id)
                    // this.activityCustomerSystemService.refundPayPointV2(getCustomer._id, arrOrder[i].final_fee + tempServiceFee, findGroupOrder, arrOrder[i])
                }
                arrOrder[i].id_cancel_system = {
                    id_reason_cancel: getReasonCancelOutDate._id,
                    date_create: new Date(Date.now()).toISOString()
                };
                arrOrder[i].status = "cancel";
                await arrOrder[i].save();
            }

            // const dateNow = new Date(Date.now()).getTime();
            // // 15p gan toi thoi gian lam viec van k ai nhan thi tu dong huy
            // const dateNow15MinutesAgo = new Date(dateNow + 900000).toISOString();
            // const query = {
            //     $and: [
            //         { date_work: { $lt: dateNow15MinutesAgo } },
            //         { status: "pending" }
            //     ]
            // }
            // const arrOrder = await this.orderModel.find(query)
            //     .select({
            //         id_customer: 1, id_group_order: 1, date_work: 1, status: 1, service_fee: 1, final_fee: 1, initial_fee: 1,
            //         pending_money: 1, platform_fee: 1, net_income_collaborator: 1, refund_money: 1
            //     })
            // const getReasonCancelOutDate = await this.reasonCancelModel.findOne({ apply_user: "system_out_date" })

            // for (const item of arrOrder) {
            //     const findGroupOrder = await this.groupOrderModel.findById(item.id_group_order)

            //     if (findGroupOrder) {
            //         if (findGroupOrder.type === "schedule") {
            //             const query = {
            //                 $and: [
            //                     { id_group_order: findGroupOrder._id },
            //                     {
            //                         $or: [
            //                             { status: "pending" },
            //                             { status: "confirm" }
            //                         ]
            //                     }
            //                 ]
            //             }
            //             const getOrderPendingConfirm = await this.orderModel.find(query)
            //                 .select({ platform_fee: 1, id_collaborator: 1, date_work: 1, service_fee: 1, final_fee: 1, initial_fee: 1, status: 1, pending_money: 1, refund_money: 1, is_duplicate: 1 });
            //             const arrTemp = await this.generalHandleService.sortArrObject(getOrderPendingConfirm, "date_work", 1)
            //             const findGetOrder = arrTemp.findIndex(x => x.date_work === item.date_work);
            //             const checkIsConfirm = arrTemp.findIndex(x => x.status === "confirm");
            //             if (findGetOrder === 0 && arrTemp.length > 1) {
            //                 let fee_service = 0;
            //                 for (const itemOrder of item.service_fee) {
            //                     fee_service += itemOrder["fee"];
            //                 }
            //                 const nextOrder = arrTemp[findGetOrder + 1];
            //                 const temp_service_fee = item.service_fee;
            //                 const temp_pending_money = item.pending_money;
            //                 nextOrder.service_fee = temp_service_fee;
            //                 nextOrder.pending_money = temp_pending_money;
            //                 nextOrder.final_fee += fee_service;
            //                 await nextOrder.save();
            //                 item.service_fee = [];
            //                 item.pending_money = 0;
            //                 item.final_fee -= fee_service;
            //             }

            //             if (item.is_duplicate === false && arrTemp.length > 1) {
            //                 item.is_duplicate = true;
            //                 arrTemp[1].is_duplicate = false;
            //                 findGroupOrder.status = arrTemp[1].status;
            //                 if (checkIsConfirm > -1) {
            //                     const findCollaborator = await this.collaboratorModel.findById(arrTemp[checkIsConfirm].id_collaborator);
            //                     findCollaborator.gift_remainder += item.platform_fee - arrTemp[1].platform_fee;
            //                     if (findGroupOrder.payment_method === "cash") findCollaborator.gift_remainder +=
            //                         item.pending_money - arrTemp[1].pending_money;
            //                     await findCollaborator.save();
            //                 }
            //                 await arrTemp[1].save();
            //             } else if (item.is_duplicate === true && arrTemp.length > 1) {
            //                 findGroupOrder.status = arrTemp[1].status;
            //             }
            //             else {
            //                 findGroupOrder.status = "cancel";
            //                 if (checkIsConfirm > -1) {
            //                     const findCollaborator = await this.collaboratorModel.findById(arrTemp[checkIsConfirm].id_collaborator);
            //                     findCollaborator.gift_remainder += item.platform_fee
            //                     if (findGroupOrder.payment_method === "cash") findCollaborator.gift_remainder += item.pending_money;
            //                     await findCollaborator.save();
            //                 }
            //             }

            //         } else {
            //             const findOrderDone = await this.orderModel.findOne({ stauts: "done", id_group_order: item._id })
            //             findGroupOrder.status = (findOrderDone) ? "done" : "cancel";
            //         }
            //         findGroupOrder.temp_net_income_collaborator = findGroupOrder.temp_net_income_collaborator - item.net_income_collaborator;
            //         findGroupOrder.temp_pending_money = findGroupOrder.temp_pending_money - item.pending_money;
            //         findGroupOrder.temp_refund_money = findGroupOrder.temp_refund_money - item.refund_money;
            //         findGroupOrder.temp_initial_fee = findGroupOrder.temp_initial_fee - item.initial_fee;
            //         findGroupOrder.temp_final_fee = findGroupOrder.temp_final_fee - item.final_fee;
            //         findGroupOrder.temp_platform_fee = findGroupOrder.temp_platform_fee - item.platform_fee;
            //         if (findGroupOrder.status === "cancel") findGroupOrder.id_cancel_system = {
            //             id_reason_cancel: getReasonCancelOutDate._id,
            //             date_create: new Date(Date.now()).toISOString()
            //         };
            //         await findGroupOrder.save();
            //     }
            //     const getCustomer = await this.customerModel.findById(item.id_customer);
            //     if (getCustomer) {
            //         if (item.payment_method === "point") {
            //             getCustomer.cash += item.final_fee;
            //             getCustomer.pay_point += item.final_fee;
            //         }
            //         getCustomer.save();
            //         this.activitySystemService.cancelOrderBySystem(getCustomer._id, item._id)
            //     }
            //     item.id_cancel_system = {
            //         id_reason_cancel: getReasonCancelOutDate._id,
            //         date_create: new Date(Date.now()).toISOString()
            //     };
            //     item.status = "cancel";
            //     await item.save();
            // }
        } catch (err) {
            console.log(err);

            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async cancelOrderConfirmOutDate() {
        try {
            const dateNow = new Date(Date.now()).getTime();
            const dateNow15MinutesAgo = new Date(dateNow - 900000).toISOString();
            const query = {
                $and: [
                    { date_work: { $lt: dateNow15MinutesAgo } },
                    { status: "confirm" }
                ]
            }
            const arrOrder = await this.orderModel.find(query)
                .select({
                    id_customer: 1, id_group_order: 1, date_work: 1, status: 1, service_fee: 1, final_fee: 1, initial_fee: 1,
                    pending_money: 1, platform_fee: 1, net_income_collaborator: 1, refund_money: 1
                })
            // console.log(arrOrder, 'arrOrder')
            for (const item of arrOrder) {
                const findGroupOrder = await this.groupOrderModel.findById(item.id_group_order)
                item.status = "cancel";

                if (findGroupOrder) {
                    if (findGroupOrder.type === "schedule") {

                        const query = {
                            $and: [
                                { id_group_order: findGroupOrder._id },
                                { status: "pending" }
                            ]
                        }
                        const getOrderPending = await this.orderModel.find(query)
                            .select({ date_work: 1, service_fee: 1, final_fee: 1, initial_fee: 1, status: 1, pending_money: 1, refund_money: 1, is_duplicate: 1 });
                        const arrTemp = await this.generalHandleService.sortArrObject(getOrderPending, "date_work", 1)
                        const getOrderDone = await this.orderModel.findOne({ status: "done", id_group_order: findGroupOrder._id })

                        if (!getOrderDone || item.service_fee.length > 0) {
                            if (getOrderPending.length > 1) {
                                let serviceFee = 0;
                                for (let serviceFeeItem of item.service_fee) {
                                    serviceFee += serviceFeeItem["fee"];
                                }
                                arrTemp[1].service_fee = item.service_fee;
                                arrTemp[1].final_fee += serviceFee;
                                if (arrTemp[1].pending_money > 0) arrTemp[1].pending_money += serviceFee;
                                if (arrTemp[1].refund_money > 0) arrTemp[1].refund_money -= serviceFee;
                                await arrTemp[1].save();
                                item.service_fee = [];
                                item.final_fee -= serviceFee;
                                if (item.pending_money > 0) item.pending_money -= serviceFee;
                                if (item.refund_money > 0) item.refund_money += serviceFee;
                            }
                        }
                        if (item.is_duplicate === false && getOrderPending.length > 1) {
                            item.is_duplicate = true;
                            arrTemp[1].is_duplicate = false;
                            await arrTemp[1].save();
                        }
                        findGroupOrder.status = (getOrderPending.length > 0) ? "doing" : (getOrderDone) ? "done" : "cancel";
                        findGroupOrder.temp_net_income_collaborator = findGroupOrder.temp_net_income_collaborator - item.net_income_collaborator;
                        findGroupOrder.temp_pending_money = findGroupOrder.temp_pending_money - item.pending_money;
                        findGroupOrder.temp_refund_money = findGroupOrder.temp_refund_money - item.refund_money;
                        findGroupOrder.temp_initial_fee = findGroupOrder.temp_initial_fee - item.initial_fee;
                        findGroupOrder.temp_final_fee = findGroupOrder.temp_final_fee - item.final_fee;
                        findGroupOrder.temp_platform_fee = findGroupOrder.temp_platform_fee - item.platform_fee;

                        // const findOrderDone = await this.orderModel.findOne({ stauts: "done", id_group_order: item._id })
                        // const findOrderPendingOrConfirm = await this.orderModel.findOne({
                        //     $and: [
                        //         {
                        //             $or: [
                        //                 { stauts: "pending" },
                        //                 { stauts: "confirm" },
                        //             ]
                        //         },
                        //         { id_group_order: findGroupOrder._id }
                        //     ]
                        // }
                        // )
                        // findGroupOrder.status = (findOrderPendingOrConfirm) ? "doing" :
                        //     (findOrderDone) ? "done" : "cancel";

                    } else {
                        const findOrderDone = await this.orderModel.findOne({ stauts: "done", id_group_order: item._id })
                        findGroupOrder.status = (findOrderDone) ? "done" : "cancel";
                    }
                }
                const getCustomer = await this.customerRepositoryService.findOneById(item.id_customer.toString());
                if (getCustomer) {
                    if (item.payment_method === "point") {
                        getCustomer.cash += item.final_fee;
                        getCustomer.pay_point += item.final_fee;
                    }
                    await this.customerRepositoryService.findByIdAndUpdate(getCustomer._id, getCustomer);
                }

                const findCollaborator = await this.collaboratorRepositoryService.findOneById(item.id_collaborator.toString());

                if (findCollaborator) {
                    if (findGroupOrder.type === "schedule") {

                        findCollaborator.gift_remainder += findGroupOrder.temp_platform_fee;
                        // if (findGroupOrder.payment_method === "cash") {
                        findCollaborator.gift_remainder += findGroupOrder.temp_pending_money;
                        // }


                    } else {
                        findCollaborator.gift_remainder += item.platform_fee;
                        // if (item.payment_method === "cash") {
                        findCollaborator.gift_remainder = findCollaborator.gift_remainder - item.pending_money;
                        // } else {
                        //     findCollaborator.gift_remainder += item.platform_fee;
                        // }
                    }
                    const lock_time = new Date(Date.now()).getTime() + 999999999999999999999999999999999;
                    findCollaborator.is_lock_time = true;
                    // nhan roi khong lam, bao qua nha
                    findCollaborator.lock_time = new Date(lock_time).toISOString();
                    await findCollaborator.save();
                    this.activitySystemService.cancelOrderConfirmBySystem(getCustomer._id, findCollaborator._id, item._id)
                }

                // if (findGroupOrder.status === "doing") {
                //     const getOrderDone = await this.orderModel.findOne({ status: "done", id_group_order: findGroupOrder._id })
                //     const positionOrder = findGroupOrder.date_work_schedule.findIndex(x => new Date(x.date).getTime() === new Date(item.date_work).getTime());
                //     if((positionOrder + 1) < findGroupOrder.date_work_schedule.length) {
                //         item.is_duplicate = true;
                //         const getNextOrder = await this.orderModel.findOne({
                //             date_work: findGroupOrder.date_work_schedule[positionOrder + 1],
                //             id_group_order: findGroupOrder._id
                //         })
                //         getNextOrder.is_duplicate = false;
                //         if (!getOrderDone) {
                //             let serviceFee = 0;
                //             for (const itemServiceFee of item.service_fee) {
                //                 serviceFee += itemServiceFee["fee"]
                //             }
                //             getNextOrder.service_fee = item.service_fee;
                //             getNextOrder.final_fee += serviceFee;
                //             await getNextOrder.save();
                //             item.service_fee = [];
                //             item.final_fee = item.final_fee - serviceFee;
                //         }
                //         findGroupOrder.temp_net_income_collaborator = findGroupOrder.temp_net_income_collaborator - item.net_income_collaborator;
                //         findGroupOrder.temp_pending_money = findGroupOrder.temp_pending_money - item.pending_money;
                //         findGroupOrder.temp_refund_money = findGroupOrder.temp_refund_money - item.refund_money;
                //         findGroupOrder.temp_initial_fee = findGroupOrder.temp_initial_fee - item.initial_fee;
                //         findGroupOrder.temp_final_fee = findGroupOrder.temp_final_fee - item.final_fee;
                //         findGroupOrder.temp_platform_fee = findGroupOrder.temp_platform_fee - item.platform_fee;
                //     } else {
                //         findGroupOrder.status = (getOrderDone) ? "done" : "cancel"
                //     }
                // }

                await findGroupOrder.save();
                await item.save();
            }
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async pushNotiOrder() {
        try {
            const currentDate = new Date(Date.now());
            const getCollaboratorSetting = await this.collaboratorSettingModel.findOne()
            const timePushNoti = getCollaboratorSetting.time_push_noti_collaborator ? getCollaboratorSetting.time_push_noti_collaborator : 3;
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
                            { id_favourite_collaborator: { $size: 0 } }
                        ]

                    }
                }
            ]);
            for (let groupOrder of getGroupOrder) {
                if (groupOrder.id_favourite_collaborator.length > 0) {
                    this.pushNotiSystemService.pushNotiCollaboratorFavorite(groupOrder)
                } else {
                    this.pushNotiSystemService.pushNotiCollaborator(groupOrder)
                }
            }
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async systemReviewOrder() {
        try {
            const currentDate = new Date(Date.now());
            const getOrder = await this.orderModel.aggregate([
                {
                    $addFields: {
                        startDate: {
                            $dateFromString: {
                                dateString: "$end_date_work"
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
                                unit: "hour"
                            }
                        },
                    },
                },
                {
                    $match: {
                        $and: [
                            {
                                $expr: {
                                    $gte:
                                        ["$timeDifferent", 48]
                                }
                            },
                            {
                                status: 'done',
                            },
                            { star: 0 }
                        ]

                    }
                }
            ]);
            for (let item of getOrder) {
                const getCollaborator = await this.collaboratorRepositoryService.findOneById(item.id_collaborator);
                const getItem = await this.orderModel.findById(item._id);
                getCollaborator.total_review += 1;
                getCollaborator.total_star += 5;
                let tempStar = 0;
                if (getCollaborator.total_review <= 5) {
                    const temp: number = 5 - getCollaborator.total_review;
                    tempStar = Number(getCollaborator.total_star + Number(temp * 5)) / Number(getCollaborator.total_review + temp);
                } else {
                    tempStar = Number(getCollaborator.total_star / getCollaborator.total_review)
                }
                getCollaborator.star = Number(tempStar.toFixed(1));
                getItem.is_system_review = true;
                getItem.active_quick_review = true;
                getItem.status_handle_review = "done";
                getItem.star = 5;
                await getItem.save();
                await getCollaborator.save();
                ////////////////////////////////////////////////////////////////
                // cộng tiền cho ctv nếu ctv đó hoàn thành 3 ca 
                if (getCollaborator.id_inviter) {
                    const query = {
                        is_delete: false,
                        id_collaborator: getCollaborator._id,
                        status: 'done',
                        star: { $gt: 0 }
                    }
                    const getToTalDoneOrder = await this.orderModel.count(query)
                    if (getToTalDoneOrder >= 3 && !getCollaborator.is_added_gift_remainder) {
                        const getOrder = await this.orderModel.find(query, { start: 1 })
                            .sort({ date_work: 1 })
                            .limit(3)
                        let check = true;
                        for (const order of getOrder) {
                            if (order.star < 4) {
                                check = false;
                                break;
                            }
                        }
                        // if (check) {
                        //     this.inviteCodeSystemService.addGiftRemainder('vi', getCollaborator._id);
                        // }
                    }
                }
                // kết thúc cộng tiền cho ctv nếu ctv đó hoàn thành 3 ca
            }
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async processRemindPunishJobForCollaborator() {
        try {
            const currentTime = new Date();
            //31 phút trước kể từ bây giờ
            const minutes30 = new Date(currentTime.getTime() - (0.52 * 60 * 60 * 1000));
            const iPageOrder = {
                start: 0,
                length: 100,
            }
            const queryOrder = {
                $and: [
                    { status: "confirm" },
                    {
                        date_work: {
                            $gte: minutes30.toISOString(),
                            $lte: currentTime.toISOString()
                        }
                    }
                ]
            }
            const count = await this.orderRepositoryService.countDataByCondition(queryOrder);
            console.log(count, "số đơn đang trễ");
            
            const currentDate = new Date(Date.now()).toISOString();
            const dateNow = new Date(currentDate).getTime()

            const getPolicyLate1 = await this.punishPolicyRepositoryService.findOne({ _id: "6625be2f0b697125a352ed41" });
            if (!getPolicyLate1) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, "vi", null)], HttpStatus.NOT_FOUND);
            const getPolicyLate2 = await this.punishPolicyRepositoryService.findOne({ _id: "6625bf78fa879da5688fc572" });
            if (!getPolicyLate2) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, "vi", null)], HttpStatus.NOT_FOUND);

            do {
                const arrOrder = await this.orderModel.find(queryOrder)
                    .sort({ date_create: 1 })
                    .skip(iPageOrder.start)
                    .limit(iPageOrder.length);

                for (const order of arrOrder) {

                    const dateWork = new Date(order.date_work).getTime();
                    const collaborator = await this.collaboratorRepositoryService.findOneById(order.id_collaborator.toString());
                    if (!collaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, "vi", null)], HttpStatus.NOT_FOUND);
                    const previousBalance = {
                        work_wallet: collaborator.work_wallet,
                        collaborator_wallet: collaborator.collaborator_wallet
                    }
                    if (dateNow - dateWork >= 899999) {
                        const query = {
                            $and: [
                                { is_delete: false },
                                { id_order: order._id },
                                { id_collaborator: order.id_collaborator },
                                { note_admin: "Phạt tiền bắt đầu ca trễ lần 1" }
                            ]
                        }

                        const check = await this.punishTicketRepositoryService.countDataByCondition(query);
                        console.log(check, "check");
                        
                        // check > 1 ? console.log(`${check} --- ${order._id}`) : null;
                        if (check < 1) {
                            const arrDeviceToken = await this.deviceTokenModel.find({ user_id: order.id_collaborator, user_object: "collaborator" })
                            const description = {
                                vi: `🔥 Đã 15 phút và bạn chưa nhấn "Bắt đầu ca làm" !!!\n ❗ Bạn bị phạt 15.000 đ, ca làm việc ${order.id_view}`,
                                en: `It's been 15 minutes and you haven't pressed "Start shift" !!!\n ❗ You are fined 15,000 VND, shift ${order.id_view}`
                            }
                            const title = {
                                vi: `⏰ Thông báo`,
                                en: `⏰ Notification`
                            }
                            const payloadNotification = {
                                title: title,
                                description: description,
                                user_object: "collaborator",
                                id_collaborator: order.id_collaborator.toString(),
                                type_notification: "activity",
                                related_id: null
                            }
                            await this.notificationSystemService.newActivity(payloadNotification);
                            if (arrDeviceToken.length > 0) {
                                const playload = {
                                    title: title.vi,
                                    body: description.vi,
                                    token: [arrDeviceToken[0].token]
                                }
                                for (let i = 1; i < arrDeviceToken.length; i++) {
                                    playload.token.push(arrDeviceToken[i].token)
                                }
                                this.notificationService.send(playload)
                            }

                            const payload: createPunishTicketFromPolicyDTO = {
                                id_order: order._id,
                                id_collaborator: order.id_collaborator.toString(),
                                id_punish_policy: getPolicyLate1._id,
                                is_verify_now: true,
                                note_admin: "Phạt tiền bắt đầu ca trễ lần 1"
                            }
                            const punishticket = await this.punishTicketSystemService.createPunishTicketFromPolicy('vi', payload);
                            const ticket  = await this.punishTicketSystemService.waitingToDoingPunishTicket("vi",punishticket);

                            const transaction = await this.transactionRepositoryService.findOneById(ticket.id_transaction);
                            await this.activitySystemService.createTransaction(transaction);

                            await this.transactionSystemService.verifyTransaction('vi', ticket.id_transaction);
                            await this.activitySystemService.verifyTransaction(transaction, previousBalance);
                            
                            await this.punishTicketSystemService.doingToDonePunishTicket('vi',punishticket);

                            await this.activitySystemService.CollaboratorLate(ticket, 15, previousBalance);
                        }
                    }
                    if (dateNow - dateWork >= 1799999) {
                        const query = {
                            $and: [
                                { is_delete: false },
                                { id_order: order._id },
                                { id_collaborator: order.id_collaborator },
                                { note_admin: "Phạt tiền bắt đầu ca trễ lần 2" }
                            ]
                        }
                        const check = await this.punishTicketRepositoryService.countDataByCondition(query);
                        // check > 1 ? console.log(`${check} --- ${order._id}`) : null;
                        console.log(check , 'check2');
                        
                        if (check < 1) {
                            const arrDeviceToken = await this.deviceTokenModel.find({ user_id: order.id_collaborator, user_object: "collaborator" })
                            const description = {
                                vi: `🔥 Đã 30 phút và bạn chưa nhấn "Bắt đầu ca làm" !!!\n❗ Bạn bị phạt 35.000 đ, ca làm việc ${order.id_view}`,
                                en: `🔥 It's been 30 minutes and you haven't pressed "Start shift" !!!\n❗ You are fined 35,000 VND, shift ${order.id_view}`
                            }
                            const title = {
                                vi: `⏰ Thông báo`,
                                en: `⏰ Notification`
                            }
                            const payloadNotification = {
                                title: title,
                                description: description,
                                user_object: "collaborator",
                                id_collaborator: order.id_collaborator.toString(),
                                type_notification: "activity",
                                related_id: null
                            }
                            await this.notificationSystemService.newActivity(payloadNotification);
                            if (arrDeviceToken.length > 0) {
                                const playload = {
                                    title: title.vi,
                                    body: description.vi,
                                    token: [arrDeviceToken[0].token]
                                }
                                for (let i = 1; i < arrDeviceToken.length; i++) {
                                    playload.token.push(arrDeviceToken[i].token)
                                }
                                this.notificationService.send(playload)
                            }
                            // const payload: PunishCollaboratorDTOAdmin = {
                                // money: 35000,
                                // punish_note: "Phạt tiền bắt đầu ca trễ lần 2",
                                // id_order: order._id,
                                // id_punish: "6461b39fc3993c7752770ef1"
                            // }
                            // await this.punishManagerService.systemMonetaryFineCollaborator("vi", order.id_collaborator, payload);
                            const payload: createPunishTicketFromPolicyDTO={
                                id_punish_policy:getPolicyLate2._id,
                                id_collaborator:order.id_collaborator.toString(),
                                id_order:order._id,
                                is_verify_now:true,
                                note_admin:"Phạt bắt đầu ca trễ lần 2"
                            } 
                            let ticket = await this.punishTicketSystemService.createPunishTicketFromPolicy('vi', payload);
                            ticket = await this.punishTicketSystemService.waitingToDoingPunishTicket("vi",ticket);

                            const transaction = await this.transactionRepositoryService.findOneById(ticket.id_transaction);
                            await this.activitySystemService.createTransaction(transaction);

                            await this.transactionSystemService.verifyTransaction('vi', ticket.id_transaction);
                            await this.activitySystemService.verifyTransaction(transaction, previousBalance);

                            await this.punishTicketSystemService.doingToDonePunishTicket('vi',ticket);
                            await this.activitySystemService.CollaboratorLate(ticket, 30, previousBalance);

                        }
                    }
                }
                iPageOrder.start += 100;
            } while (iPageOrder.start <= count)
        } catch (err) {
            console.log(err);

            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async processRemindPunishEndJobForCollaborator() {
        try {
            const tempArr = [10];
            const iPageOrder = {
                search: "",
                start: 0,
                length: 100,
            }
            const currentDate = new Date(Date.now());
            const arrOrder = await this.orderModel.aggregate([
                {
                    $addFields: {
                        endDate: {
                            $dateFromString: {
                                dateString: "$end_date_work"
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
                                startDate: currentDate,
                                endDate: '$endDate',
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
                                    $in:
                                        ["$timeDifferent", tempArr]
                                }
                            },
                            {
                                status: 'doing',
                            },
                        ]

                    }
                }
            ])
            //.sort({ date_work: -1 })
            //.skip(iPageOrder.start)
            //.limit(iPageOrder.length);
            const dateNow = new Date(Date.now()).getTime();

            for (const item of arrOrder) {
                //nhac nho ket thuc cong viec
                if (item.timeDifferent === 10) {
                    const arrDeviceToken = await this.deviceTokenModel.find({ user_id: item.id_collaborator, user_object: "collaborator" })
                    const title = {
                        vi: `⏰ Thông báo`,
                        en: `⏰ Thông báo`
                    }
                    const description = {
                        vi: `⏰Thời gian ca làm ${item.id_view} sẽ kết thúc sau 10 phút.\n❗ Vui lòng kiểm tra lại mọi thứ trước khi báo với khách hàng nghiệm thu.`,
                        en: `⏰Thời gian ca làm ${item.id_view} sẽ kết thúc sau 10 phút.\n❗ Vui lòng kiểm tra lại mọi thứ trước khi báo với khách hàng nghiệm thu.`
                    }
                    const payloadNotification = {
                        title: title,
                        description: description,
                        user_object: "collaborator",
                        id_collaborator: item.id_collaborator.toString(),
                        type_notification: "system",
                        related_id: null
                    }
                    await this.notificationSystemService.newActivity(payloadNotification);
                    if (arrDeviceToken.length > 0) {
                        const playload = {
                            title: title.vi,
                            body: description.vi,
                            token: [arrDeviceToken[0].token]
                        }
                        for (let i = 1; i < arrDeviceToken.length; i++) {
                            playload.token.push(arrDeviceToken[i].token)
                        }
                        this.notificationService.send(playload)
                    }
                }
                // if (item.collaborator_start_date_work !== null && item.collaborator_start_date_work > item.date_work) {
                //     const tempEndDateWrok = addHours(new Date(item.collaborator_start_date_work), item.total_estimate).getTime();
                //     if (dateNow - tempEndDateWrok < 1800000 && dateNow - tempEndDateWrok > 1740000) {
                //         const arrDeviceToken = await this.deviceTokenModel.find({ user_id: item.id_collaborator, user_object: "collaborator" })
                //         const description = {
                //             vi: `Bạn đã không kết thúc công việc trong vòng 30 phút`,
                //             en: `Bạn đã không kết thúc công việc trong vòng 30 phút`
                //         }
                //         const title = {
                //             vi: `Bạn đã không kết thúc công việc`,
                //             en: `Bạn đã không kết thúc công việc`
                //         }
                //         const payloadNotification = {
                //             title: title,
                //             description: description,
                //             user_object: "collaborator",
                //             id_collaborator: item.id_collaborator.toString(),
                //             type_notification: "system",
                //             related_id: null
                //         }
                //         await this.notificationSystemService.newActivity(payloadNotification);
                //         if (arrDeviceToken.length > 0) {
                //             const playload = {
                //                 title: "Bạn đã không kết thúc công việc",
                //                 body: "Bạn đã không kết thúc công việc trong vòng 30 phút",
                //                 token: [arrDeviceToken[0].token]
                //             }
                //             for (let i = 1; i < arrDeviceToken.length; i++) {
                //                 playload.token.push(arrDeviceToken[i].token)
                //             }
                //             this.notificationService.send(playload)
                //             const payload: PunishCollaboratorDTOAdmin = {
                //                 money: 20000,
                //                 punish_note: "Phạt tiền kết thúc ca trễ",
                //                 id_order: item._id,
                //                 id_punish: "6461ad0d42a6e5294b9fb516"
                //             }
                //             await this.punishManagerService.systemMonetaryFineCollaborator("vi", item.id_collaborator, payload);
                //         }
                //     }
                // }
                // //sau 30p khong ket thuc cong viec
                // else if (dateNow - dateEndWork < 1800000 && dateNow - dateEndWork > 1740000) {
                //     const arrDeviceToken = await this.deviceTokenModel.find({ user_id: item.id_collaborator, user_object: "collaborator" })
                //     const description = {
                //         vi: `Bạn đã không kết thúc công việc trong vòng 30 phút`,
                //         en: `Bạn đã không kết thúc công việc trong vòng 30 phút`
                //     }
                //     const title = {
                //         vi: `Bạn đã không kết thúc công việc`,
                //         en: `Bạn đã không kết thúc công việc`
                //     }
                //     const payloadNotification = {
                //         title: title,
                //         description: description,
                //         user_object: "collaborator",
                //         id_collaborator: item.id_collaborator.toString(),
                //         type_notification: "system",
                //         related_id: null
                //     }
                //     await this.notificationSystemService.newActivity(payloadNotification);
                //     if (arrDeviceToken.length > 0) {
                //         const playload = {
                //             title: "Bạn đã không kết thúc công việc",
                //             body: "Bạn đã không kết thúc công việc trong vòng 30 phút",
                //             token: [arrDeviceToken[0].token]
                //         }
                //         for (let i = 1; i < arrDeviceToken.length; i++) {
                //             playload.token.push(arrDeviceToken[i].token)
                //         }
                //         this.notificationService.send(playload)
                //         const payload: PunishCollaboratorDTOAdmin = {
                //             money: 20000,
                //             punish_note: "Phạt tiền kết thúc ca trễ",
                //             id_order: item._id,
                //             id_punish: "6461ad0d42a6e5294b9fb516"
                //         }
                //         await this.punishManagerService.systemMonetaryFineCollaborator("vi", item.id_collaborator, payload);
                //     }
                // }
            }
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }
    //
    async autoCheckReview() {
        try {
            const query = {
                $and: [
                    { is_delete: false },
                    { status: 'done' },
                    { star: 5 },
                    { is_check_admin: false }
                ]
            }
            const getOrder = await this.orderModel.find(query);
            for (let order of getOrder) {
                order.is_check_admin = true;
                await order.save()
                this.activitySystemService.adminCheckReview
            }
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async processRemindCustomerOrderNotStart() {
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
            const arrOrder = await this.orderModel.find(queryOrder).skip(iPageOrder.start).limit(iPageOrder.length);
            const dateNow = new Date(Date.now()).getTime();
            for (const item of arrOrder) {
                const dateWork = new Date(item.date_work).getTime();
                if (dateNow - dateWork < 600000 && dateNow - dateWork > 540000) {
                    const arrDeviceToken = await this.deviceTokenModel.find({ user_id: item.id_customer, user_object: "customer" })
                    const arrDeviceTokenCollaborator = await this.deviceTokenModel.find({ user_id: item.id_collaborator, user_object: "collaborator" })
                    const description = {
                        vi: `Guvi ghi nhận thông tin Cộng tác viên chưa bắt đầu ca làm. CSKH của Guvi sẽ kiểm tra và liên hệ tới quý anh/chị. Nếu Cộng tác viên đã đến và bắt đầu làm việc, vui lòng bỏ qua thông báo này!`,
                        en: `Guvi has not yet received information about employees starting to work from your home. We will check with CTV
                        and report back to you, hope you understand and please wait. If the CTV has arrived and started working, please ignore this message`
                    }
                    const title = {
                        vi: `Cộng tác viên không đến làm`,
                        en: `Collaborators do not come to work`
                    }
                    const payloadNotification = {
                        title: title,
                        description: description,
                        user_object: "customer",
                        id_customer: item.id_customer.toString(),
                        type_notification: "activity",
                        related_id: null
                    }
                    await this.notificationSystemService.newActivity(payloadNotification);
                    const descriptionCollaborator = {
                        vi: `Bạn chưa bắt đầu ca làm. Nếu bạn đã đến và bắt đầu làm việc, vui lòng bỏ qua thông báo này`,
                        en: `You haven't started your shift yet. If you have already arrived and started working, please ignore this message`
                    }
                    const titleCollaborator = {
                        vi: `Bạn đã không bắt đầu ca làm`,
                        en: `You didn't start your shift`
                    }
                    const payloadNotificationCollaborator = {
                        title: titleCollaborator,
                        description: descriptionCollaborator,
                        user_object: "collaborator",
                        id_collaborator: item.id_collaborator.toString(),
                        type_notification: "activity",
                        related_id: null
                    }
                    await this.notificationSystemService.newActivity(payloadNotificationCollaborator);
                    if (arrDeviceToken.length > 0) {
                        const playload = {
                            title: "Cộng tác viên không đến làm",
                            body: "Guvi ghi nhận thông tin Cộng tác viên chưa bắt đầu ca làm. CSKH của Guvi sẽ kiểm tra và liên hệ tới quý anh/chị. Nếu Cộng tác viên đã đến và bắt đầu làm việc, vui lòng bỏ qua thông báo này!",
                            token: [arrDeviceToken[0].token]
                        }
                        for (let i = 1; i < arrDeviceToken.length; i++) {
                            playload.token.push(arrDeviceToken[i].token)
                        }
                        this.notificationService.send(playload)
                    }
                    if (arrDeviceTokenCollaborator.length > 0) {
                        const playload = {
                            title: "Bạn đã không đến làm việc",
                            body: "Bạn đã không đến làm việc",
                            token: [arrDeviceTokenCollaborator[0].token]
                        }
                        for (let i = 1; i < arrDeviceTokenCollaborator.length; i++) {
                            playload.token.push(arrDeviceTokenCollaborator[i].token)
                        }
                        this.notificationService.send(playload)
                    }
                }
            }
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async pushNotiOrderV2() {
        try {
            const currentDate = new Date(Date.now());
            const getCollaboratorSetting = await this.collaboratorSettingModel.findOne()
            const timePushNoti = getCollaboratorSetting.time_push_noti_collaborator ? getCollaboratorSetting.time_push_noti_collaborator : 3;
            const tempArr = [timePushNoti, 25, 20]
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
                                    $in:
                                        ["$timeDifferent", tempArr]
                                }
                            },
                            {
                                status: 'pending',
                            },
                        ]

                    }
                }
            ]);

            for (let groupOrder of getGroupOrder) {
                let arrCollaborator = [];
                if (groupOrder.timeDifferent === timePushNoti) {
                    // nếu qua 15 mà chưa ai nhận
                    if (groupOrder.id_favourite_collaborator.length > 0) { // có CTV yêu thích
                        // tìm CTV trong quận loại trừ các CTV yêu thích và CTV hạn chế
                        arrCollaborator = await this.collaboratorSystemService.collaboratorInDistrict(groupOrder);
                        console.log('bắn cho CTV trong quận');

                    } else {
                        // ko có CTV yêu thích
                        // tìm các CTV trong thành phố trừ các CTV yêu thích và hạn chế,
                        // loại bỏ thêm CTV đăng ký trong quận
                        arrCollaborator = await this.collaboratorSystemService.collaboratorInCity(groupOrder);
                        console.log('bắn cho CTV trong thành phố');

                    }
                } else if (groupOrder.timeDifferent === 25) {
                    if (groupOrder.id_favourite_collaborator.length > 0) {
                        // có CTV yêu thích
                        // tìm các CTV trong thành phố trừ các CTV yêu thích và hạn chế,
                        // loại bỏ thêm CTV đăng ký trong quận
                        arrCollaborator = await this.collaboratorSystemService.collaboratorInCity(groupOrder);
                        console.log('bắn cho CTV trong thành phố 2');
                    }
                }

                if (arrCollaborator.length > 0) {
                    const payload = {
                        title: "🔥 Có công việc mới !!!",
                        body: "🤩 Có công việc mới hấp dẫn gần bạn \n👉 Nhấn để xem ngay nhé",
                        data: "guvipartner://",
                        user_id: arrCollaborator,
                        user_object: 'collaborator'
                    }
                    this.pushNotiSystemService.pushNotiMultipleUser(payload);
                }
            }
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async CollaboratorLate10Minutes() {
        try {
            const currentDate = new Date(Date.now());
            const tempArr = [10];
            const arrOrder = await this.orderModel.aggregate([
                {
                    $addFields: {
                        startDate: {
                            $dateFromString: {
                                dateString: "$date_work"
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
                                    $in:
                                        ["$timeDifferent", tempArr]
                                }
                            },
                            {
                                status: 'confirm',
                            },
                        ]

                    }
                }
            ])

            for (const order of arrOrder) {
                const getCustomer = await this.customerRepositoryService.findOneById(order.id_customer);
                if (order.timeDifferent === 10) {

                    // Thông báo KH
                    const title = {
                        vi: "GUVI",
                        en: "GUVI"
                    }
                    const description = {
                        vi: `Hệ thống ghi nhận thông tin "${order.name_collaborator}" chưa xác nhận bắt đầu ca làm. Nếu "Cộng tác viên" vẫn chưa tới, vui lòng liên hệ hotline 1900.0027 để được hỗ trợ.\nVui lòng bỏ qua thông báo này nếu "Cộng tác viên" đã bắt đầu công việc.`,
                        en: `The system records that "${order.name_collaborator}" has not confirmed the start of the shift. If "Collaborator" has not yet arrived, please contact hotline 1900.0027 for support.\nPlease ignore this message if the "Collaborator" has already started work.`
                    }
                    const payloadNoti = {
                        title: title,
                        description: description,
                        user_object: "customer",
                        id_customer: getCustomer._id,
                        type_notification: "system",
                    }
                    this.notificationSystemService.newActivity(payloadNoti)
                    const arrDevice = await this.deviceTokenModel.find({ user_id: getCustomer._id, user_object: "customer" });
                    if (arrDevice.length > 0) {
                        const payload = {
                            title: title.vi,
                            body: description.vi,
                            token: [arrDevice[0].token],
                            data: { link: "guviapp://Activity" }
                        }
                        for (let i = 1; i < arrDevice.length; i++) {
                            payload.token.push(arrDevice[i].token)
                        }
                        this.notificationService.send(payload)
                    }
                    // Thông báo CTV
                    const title2 = {
                        vi: `⏰ Thông báo `,
                        en: `⏰ Thông báo `
                    }
                    const des2 = {
                        vi: `🔥 Vui lòng kiểm tra trạng thái công việc ${order.id_view}\n 👉 Nhấn "Bắt đầu ca làm" để tránh bị phạt.`,
                        en: `🔥 Please check the job status ${order.id_view}\n 👉 Click "Start Shift" to avoid penalties.`
                    }

                    const payloadNotiCollab = {
                        title: title2,
                        description: des2,
                        user_object: "collaborator",
                        id_collaborator: order.id_collaborator,
                        type_notification: "system",
                    }
                    this.notificationSystemService.newActivity(payloadNotiCollab)
                    const arrDeviceCollab = await this.deviceTokenModel.find({ user_id: order.id_collaborator, user_object: "collaborator" });
                    if (arrDeviceCollab.length > 0) {
                        const payload = {
                            title: title2.vi,
                            body: des2.vi,
                            token: [arrDeviceCollab[0].token],
                            data: { link: "guvipartner://Activity" }
                        }
                        for (let i = 1; i < arrDeviceCollab.length; i++) {
                            payload.token.push(arrDeviceCollab[i].token)
                        }
                        this.notificationService.send(payload)
                    }
                }
            }
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    // Sau 13 phut neu khong bam thanh toan ben app momo thi giao dich se that bai
    async cancelProcessingOrderAfter13Minutes() {
        try {
            const fewMinutesAgo = new Date(Date.now() - 13 * 60 * 1000).toISOString()
            const query = {
                $and: [
                    { date_create: { $lt: fewMinutesAgo } },
                    { status: STATUS_ORDER.processing },
                    { payment_method: PAYMENT_METHOD.momo }
                ]
            }

            const arrGroupOrder = await this.groupOrderModel.find(query)
            .select({
                id_customer: 1, status: 1, service_fee: 1, final_fee: 1, initial_fee: 1, net_income_collaborator: 1, payment_method: 1
            })

            if (arrGroupOrder.length > 0) {
                let subjectAction ={
                    type: 'system'
                }
    
                const stepCancel = {
                    isCancel: true,
                    isRefundCustomer: false,
                    isRefundCollaborator: false,
                    isPunishCollaborator: false,
                    isPunishCustomer: false,
                    isUnassignCollaborator: false,
                    isMinusNextOrderCollaborator: false
                }
    
                const idCancel = '6721e44f2d7b05edb4f596f3'
                
                for (let i = 0; i < arrGroupOrder.length; i++) {
                    await this.groupOrderSystemService2.cancelGroupOrder('vi', subjectAction, arrGroupOrder[i]._id, idCancel, stepCancel, false, true)
                }
            }

        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    // Sau 15 phut neu khong bam thanh toan ben vnpay thi giao dich se that bai
    async cancelProcessingOrderAfter15Minutes() {
        try {
            const fewMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString()
            const query = {
                $and: [
                    { transaction_execution_date: { $lt: fewMinutesAgo } },
                    { status: STATUS_ORDER.processing },
                    { payment_method: { $in: [PAYMENT_METHOD.vnpay, PAYMENT_METHOD.vnbank, PAYMENT_METHOD.intcard] } }
                ]
            }

            const arrGroupOrder = await this.groupOrderModel.find(query)
            .select({
                id_customer: 1, status: 1, service_fee: 1, final_fee: 1, initial_fee: 1, net_income_collaborator: 1, payment_method: 1
            })

            if (arrGroupOrder.length > 0) {
                let subjectAction ={
                    type: 'system'
                }
    
                const stepCancel = {
                    isCancel: true,
                    isRefundCustomer: false,
                    isRefundCollaborator: false,
                    isPunishCollaborator: false,
                    isPunishCustomer: false,
                    isUnassignCollaborator: false,
                    isMinusNextOrderCollaborator: false
                }
    
                const idCancel = '6721e44f2d7b05edb4f596f3'
                
                for (let i = 0; i < arrGroupOrder.length; i++) {
                    await this.groupOrderSystemService2.cancelGroupOrder('vi', subjectAction, arrGroupOrder[i]._id, idCancel, stepCancel, false, true)
                }
            }

        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }
}
