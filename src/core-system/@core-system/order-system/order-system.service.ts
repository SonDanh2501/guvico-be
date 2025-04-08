import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { add, sub } from 'date-fns'
import { ERROR, iPageDTO, iPageOrderNearDTOCollaborator, MILLISECOND_IN_HOUR, stepCancelDTO } from 'src/@core'
import { createReviewDTOCustomer, iPageReviewCollaboratorDTOCustomer } from 'src/@core/dto/reivew.dto'
import { PAYMENT_METHOD, STATUS_GROUP_ORDER, STATUS_ORDER, STATUS_TRANSACTION, TYPE_GROUP_ORDER, TYPE_RESPONSE_ORDER } from 'src/@repositories/module/mongodb/@database/enum'
import { TYPE_ACTION, TYPE_SUBJECT_ACTION } from 'src/@repositories/module/mongodb/@database/enum/base.enum'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service'
import { CollaboratorOopSystemService } from 'src/core-system/@oop-system/collaborator-oop-system/collaborator-oop-system.service'
import { CustomerOopSystemService } from 'src/core-system/@oop-system/customer-oop-system/customer-oop-system.service'
import { ExtendOptionalOopSystemService } from 'src/core-system/@oop-system/extend-optional-oop-system/extend-optional-oop-system.service'
import { GroupOrderOopSystemService } from 'src/core-system/@oop-system/group-order-oop-system/group-order-oop-system.service'
import { HistoryActivityOopSystemService } from 'src/core-system/@oop-system/history-activity-oop-system/history-activity-oop-system.service'
import { NotificationOopSystemService } from 'src/core-system/@oop-system/notification-oop-system/notification-oop-system.service'
import { OptionalServiceOopSystemService } from 'src/core-system/@oop-system/optional-service-oop-system/optional-service-oop-system.service'
import { OrderOopSystemService } from 'src/core-system/@oop-system/order-oop-system/order-oop-system.service'
import { PunishPolicyOopSystemService } from 'src/core-system/@oop-system/punish-policy-oop-system/punish-policy-oop-system.service'
import { PunishTicketOopSystemService } from 'src/core-system/@oop-system/punish-ticket-oop-system/punish-ticket-oop-system.service'
import { ReasonCancelOopSystemService } from 'src/core-system/@oop-system/reason-cancel-oop-system/reason-cancel-oop-system.service'
import { ServiceOopSystemService } from 'src/core-system/@oop-system/service-oop-system/service-oop-system.service'
import { SettingOopSystemService } from 'src/core-system/@oop-system/setting-oop-system/setting-oop-system.service'
import { TransactionOopSystemService } from 'src/core-system/@oop-system/transaction-oop-system/transaction-oop-system.service'
import { NotificationSystemService } from '../notification-system/notification-system.service'
import { PaymentSystemService } from '../payment-system/payment-system.service'
import { PunishTicketSystemService } from '../punish-ticket-system/punish-ticket-system.service'
import { PushNotificationSystemService } from '../push-notification-system/push-notification-system.service'
import { RewardTicketSystemService } from '../reward-ticket-system/reward-ticket-system.service'

@Injectable()
export class OrderSystemService2 {
    constructor(
        private customExceptionService: CustomExceptionService,
        private generalHandleService: GeneralHandleService,

        private extendOptionalOopSystemService: ExtendOptionalOopSystemService,
        private optionalServiceOopSystemService: OptionalServiceOopSystemService,
        private serviceOopSystemService: ServiceOopSystemService,
        private historyActivityOopSystemService: HistoryActivityOopSystemService,
        private groupOrderOopSystemService: GroupOrderOopSystemService,
        private orderOopSystemService: OrderOopSystemService,
        private collaboratorOopSystemService: CollaboratorOopSystemService,
        private reasonCancelOopSystemService: ReasonCancelOopSystemService,
        private customerOopSystemService: CustomerOopSystemService,
        private notificationOopSystemService: NotificationOopSystemService,
        private punishTicketOopSystemService: PunishTicketOopSystemService,
        private punishPolicyOopSystemService: PunishPolicyOopSystemService,
        private transactionOopSystemService: TransactionOopSystemService,
        private settingOopSystemService: SettingOopSystemService,
<<<<<<< HEAD

        private pushNotificationSystemService: PushNotificationSystemService,
        private notificationSystemService: NotificationSystemService,
        private paymentSystemService: PaymentSystemService
=======
        private paymentSystemService: PaymentSystemService,
        private rewardTicketSystemService: RewardTicketSystemService,
        private punishTicketSystemService: PunishTicketSystemService,
>>>>>>> son
    ) {}


    async getDetailItem(lang, subjectAction, idOrder) {
        try {
            

            // let 

            // if(subjectAction.type === TYPE_SUBJECT_ACTION.admin) {

            // } else if(subjectAction.type === TYPE_SUBJECT_ACTION.collaborator) {

            // } else if(subjectAction.type === TYPE_SUBJECT_ACTION.customer) {

            // }

            const arrPopulate = [
                {path: "id_customer", select: {full_name: 1, phone: 1, id_view: 1}},
                {path: "id_collaborator", select: {full_name: 1, phone: 1, id_view: 1}},
                {path: "service._id", select: {title: 1}},
                {path: 'service.optional_service._id', select: { position: 1, screen: 1, type: 1, title: 1, is_main_optional: 1 }},
                {
                    path: 'id_group_order', select: {
                        date_work_schedule: 1, type: 1, time_schedule: 1, is_auto_order: 1, day_loop: 1,
                        temp_final_fee: 1, temp_initial_fee: 1, temp_net_income_collaborator: 1, temp_pending_money: 1, temp_refund_money: 1, temp_platform_fee: 1,
                        final_fee: 1, initial_fee: 1, net_income_collaborator: 1, pending_money: 1, refund_money: 1, platform_fee: 1
                    }
                }
            ]

            const getItem = await this.orderOopSystemService.getDetailItem(lang, idOrder, arrPopulate);
            let newResponse = getItem._doc

            if( subjectAction.type === TYPE_SUBJECT_ACTION.collaborator || subjectAction.type === TYPE_SUBJECT_ACTION.admin) {
                newResponse = {
                    ...newResponse,
                    ...{
                        total_net_income: {
                            title: "Chi tiết thu nhập",
                            name_value: "Tổng thu nhập ròng",
                            value: getItem.shift_income + getItem.tip_collaborator || 0,
                            detail: [
                                {
                                    title: "Giá trị đơn hàng",
                                    value: getItem.subtotal_fee || 0,
                                    hint: "Giá trị đơn hàng đã bao gồm phí dụng cụ (nếu có)"
                                },
                                {
                                    title: "Phí sử dụng ứng dụng",
                                    value: -getItem.platform_fee || 0,
                                    hint: null
                                },
                                {
                                    title: "Thu nhập ròng",
                                    value: getItem.shift_income || 0,
                                    hint: `Lợi nhuận còn lại sau khi đã trừ đi tất cả các chi phí hoạt động`
                                },
                                {
                                    title: "Tiền tip",
                                    value: getItem.tip_collaborator || 0,
                                    hint: null
                                }
                            ]
                        },
                        total_final_fee: {
                            title: `Hóa đơn của khách`,
                            name_value: `Khách hàng ${getItem.status === STATUS_ORDER.done ? ' đã' : ''} thanh toán`,
                            value: getItem.final_fee || 0,
                            detail: [
                                {
                                    title: "Giá trị đơn hàng",
                                    value: getItem.subtotal_fee || 0,
                                    hint: null
                                },
                                {
                                    title: "Khuyến mãi",
                                    value: getItem.final_fee - (getItem.initial_fee + getItem.pending_money + getItem.tip_collaborator) || 0,
                                    hint: null
                                },
                                {
                                    title: "Tiền tip",
                                    value: getItem.tip_collaborator || 0,
                                    hint: null
                                },
                                {
                                    title: "Phí hệ thống và thuế",
                                    value: (getItem.pending_money || 0) + getItem.value_added_tax,
                                    hint: `Bao gồm các chi phí liên quan đến quản lý, bảo trì và phát triển hệ thống, cũng như các chi phí phát sinh khác để đảm bảo chất lượng dịch vụ`
                                },
                            ]
                        },
                        work_shift_deposit: getItem.platform_fee || 0
                    }
                }
            }

            newResponse.info_linked_collaborator = newResponse.info_linked_collaborator.filter(a => a.id_collaborator.toString() === subjectAction._id.toString());

            return newResponse;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    


    async cancelOrder(lang, subjectAction, idOrder, idCancel, stepCancel: stepCancelDTO) {
        try {
            const dateNow = new Date();
            const getOrder = await this.orderOopSystemService.getDetailItem(lang, idOrder)
            const getGroupOrder = await this.groupOrderOopSystemService.getDetailItem(lang, getOrder.id_group_order);
            const getCustomer = await this.customerOopSystemService.getDetailItem(lang, getGroupOrder.id_customer)

            let refundCollaborator = 0
            if (getOrder.subtotal_fee !== getOrder.initial_fee) {
                if (getOrder.payment_method === PAYMENT_METHOD.cash) {
                    refundCollaborator = getOrder.work_shift_deposit; 
                }
            } else {
                // Giu lai cach tinh gia cu
                refundCollaborator = getOrder.platform_fee + getOrder.pending_money;
            }

            // chuan bi thong tin
            const payloadDependency = {
                customer: getCustomer,
                collaborator: null,
                group_order: getGroupOrder,
                punish_ticket: null,
                order: getOrder,
                reason_cancel: null
            }

            if(idCancel !== null) {
                const getReasonCancel = await this.reasonCancelOopSystemService.getDetailItem(lang, idCancel);
                payloadDependency.reason_cancel = getReasonCancel;
            }
            const query = {
                $and: [
                    {id_group_order: getOrder.id_group_order},
                    {status: {$in: ["confirm", "doing"]}},
                    { date_work: { $lt: getOrder.date_work }}
                ]
            }

            const checkPreviousOrder = await this.orderOopSystemService.findOne(query);
            if(checkPreviousOrder) {  
                stepCancel.isRefundCollaborator = false;
                // stepCancel.isMinusNextOrderCollaborator = false;
            } 

            let resultCancel = {
                order: {},
                refundCustomer: 0
            }
            // // 1. huy don
            if (stepCancel.isCancel === true) {



                const order = await this.orderOopSystemService.cancel(lang, getOrder, subjectAction, payloadDependency.reason_cancel._id)
                if(order.id_collaborator !== null) {
                    const getCollaborator = await this.collaboratorOopSystemService.getDetailItem(lang, order.id_collaborator);
                    payloadDependency.collaborator = getCollaborator;
                }

                // check don hang con ca lam nao nua khong, neu khong thi huy dich vu
                const query = {
                    $and: [
                        {id_group_order: order.id_group_order},
                        // {_id: {$ne: order._id}},
                        {status: {$in: ["pending", "confirm", "doing"]}}
                    ]
                }
                const findOrderConfirmPendingDoing = await this.orderOopSystemService.findOne(query);
                // console.log(findOrderConfirmPendingDoing, 'findOrderConfirmPendingDoing');
                
                if(!findOrderConfirmPendingDoing) {
                    await this.groupOrderOopSystemService.cancel(lang, order.id_group_order, subjectAction, payloadDependency.reason_cancel._id)
                }

                // check xem KH hoan thanh ca lam nao chua, neu chua day phi dich vu cho ca sau
                const query2 = {
                    $and: [
                        {id_group_order: order.id_group_order},
                        {status: {$in: ["done"]}}
                    ]
                }
                const findOrderDone = await this.orderOopSystemService.findOne(query2);
                // tim xem con don hang nao nam cho khong
                if(!findOrderDone && order.service_fee.length > 0 && findOrderConfirmPendingDoing) {
                    payloadDependency.order = await this.orderOopSystemService.moveServiceFeeNextOrder(lang, payloadDependency.order)
                }
                // neu co ca lam hoan thanh va khong con ca lam nao nua thi chuyen trang thai thanh hoan thanh
                if(findOrderDone && !findOrderConfirmPendingDoing) {
                    await this.groupOrderOopSystemService.changeStatus(lang, order.id_group_order, "done");
                }

                // Kiem tra group order = schedule hay khong
                // Neu co thi lay don hang tiep theo set is_duplicate = false
                if (getGroupOrder.type === TYPE_GROUP_ORDER.schedule) {
                    const getNextOrder = await this.orderOopSystemService.findNextOrderInGroupOrder(lang, getOrder._id)
                    await this.orderOopSystemService.updateIsDuplicate(lang, getOrder, true)
                    if (getNextOrder) {
                        await this.orderOopSystemService.updateIsDuplicate(lang, getNextOrder._id, false)
                    }
                }




                await this.historyActivityOopSystemService.cancelOrder(subjectAction, payloadDependency);
                const dateNow = new Date();
                const minute = await this.generalHandleService.calculateTimeInterval(order.date_work, dateNow, "minute")
                    await this.notificationSystemService.cancelOrder(lang, subjectAction, {type: "customer", _id: getCustomer._id, customer: getCustomer}, getGroupOrder, order, minute)
                if(payloadDependency.collaborator !== null) {
                    await this.notificationSystemService.cancelOrder(lang, subjectAction, {type: "collaborator", _id: payloadDependency.collaborator._id, collaborator: payloadDependency.collaborator}, getGroupOrder, order, minute)
                }
            }
            
            // 2. hoan tien cho KH
            if (stepCancel.isRefundCustomer === true  && getGroupOrder.status !== STATUS_GROUP_ORDER.processing) {
                if(getGroupOrder.payment_method === PAYMENT_METHOD.point) {
                    // const getFinalFeeRemain = await this.orderOopSystemService.totalFinalFeeRemain(lang, getGroupOrder._id);
                    const customer = await this.customerOopSystemService.addPayPoint(lang, payloadDependency.order.final_fee, getCustomer._id)
                    payloadDependency.customer = customer;
                    await this.historyActivityOopSystemService.refundPayPointCustomer({type: "system", _id: null}, payloadDependency, payloadDependency.order.final_fee)
                    await this.notificationSystemService.refundCustomer(lang, payloadDependency, payloadDependency.order.final_fee);
                }

                if (getGroupOrder.payment_method !== PAYMENT_METHOD.cash && getGroupOrder.payment_method !== PAYMENT_METHOD.point) {
                    const customer = await this.customerOopSystemService.addPayPoint(lang, payloadDependency.order.final_fee, getCustomer._id)
                    payloadDependency.customer = customer;
                    await this.historyActivityOopSystemService.refundPayPointCustomer({type: "system", _id: null}, payloadDependency, payloadDependency.order.final_fee)
                    await this.notificationSystemService.refundCustomer(lang, payloadDependency, payloadDependency.order.final_fee);
                }
            }


            // 3. hoan tien cho CTV
            if(stepCancel.isRefundCollaborator === true && getGroupOrder.status !== STATUS_GROUP_ORDER.processing) {
                if(getGroupOrder.id_collaborator !== null) {
                    const getCollaborator = await this.collaboratorOopSystemService.getDetailItem(lang, getGroupOrder.id_collaborator);
                    const previousBalance = {
                        work_wallet: getCollaborator.work_wallet,
                        collaborator_wallet: getCollaborator.collaborator_wallet,
                    }
                    if (refundCollaborator > 0) {
                        payloadDependency.collaborator = await this.collaboratorOopSystemService.addPointWallet(lang, getGroupOrder.id_collaborator, "work_wallet", refundCollaborator);
                        await this.historyActivityOopSystemService.refundPointWalletCollaborator({type: "system", _id: null}, payloadDependency, previousBalance, refundCollaborator);
                        await this.notificationSystemService.refundCollaborator(lang, payloadDependency, refundCollaborator);
                    } else {
                        payloadDependency.collaborator = getCollaborator
                    }
                }
            }

            // 4. check xem co phat CTV hay ko
            // old
            // if(stepCancel.isPunishCollaborator === true && getGroupOrder.status !== STATUS_GROUP_ORDER.processing) {
            //     let collaborator = await this.collaboratorOopSystemService.getDetailItem(lang, getGroupOrder.id_collaborator);
            //     let timeInterval = await this.generalHandleService.calculateTimeInterval(getOrder.date_work, dateNow, "millisecond")
            //     timeInterval = Math.abs(timeInterval)
            //     let payload: createPunishTicketFromPolicyDTO = {
            //         id_collaborator: collaborator._id,
            //         id_punish_policy: '',
            //         id_order: getOrder._id,
            //         is_verify_now: true,
            //     }
            //     if (timeInterval < 2 * MILLISECOND_IN_HOUR) {
            //         payload.id_punish_policy = '6634662361c1079edc4cf069';
            //     } else if (timeInterval < 8 * MILLISECOND_IN_HOUR) {
            //         payload.id_punish_policy = '6634664761c1079edc4cf09a';
            //     } else {
            //         payload.id_punish_policy = '6634666f61c1079edc4cf0b6';
            //     }

            //     const getPolicy = await this.punishPolicyOopSystemService.getDetailItem(lang, payload.id_punish_policy);
            //     const ticket = await this.punishTicketOopSystemService.createItemFromPolicy(lang, payload, getPolicy, payloadDependency);

            //     payloadDependency.punish_ticket = ticket
            //     if(ticket.punish_money > 0) {
            //         const previousBalance = {
            //             work_wallet: collaborator.work_wallet,
            //             collaborator_wallet: collaborator.collaborator_wallet,
            //         }
            //         collaborator = await this.collaboratorOopSystemService.minusCollaborator(lang, collaborator._id, ticket.punish_money, TYPE_GROUP_ORDER.single, TYPE_ACTION.other, false);
            //         payloadDependency.collaborator = collaborator;
                    
            //         await this.historyActivityOopSystemService.punishMoney({type: "system", _id: null}, payloadDependency, previousBalance, ticket.punish_money)
            //         await this.notificationSystemService.sendNotiPunish(lang, {type: "collaborator", _id: collaborator._id}, payloadDependency, ticket.punish_money)
            //     }

            //     // Cập nhật phiếu phạt vào trong đơn hàng
            //     const punishTicket = {
            //         id_punish_ticket: ticket._id,
            //         date_create: ticket.date_create,
            //         execution_date: new Date().toISOString(),
            //         revocation_date: null
            //     }
            //     getOrder.list_of_punish_ticket.push(punishTicket)
            //     getOrder.total_punish += ticket.punish_money
            //     getOrder.incurrence_time.push({ date_create: ticket.date_create, fee: ticket.punish_money })
            //     payloadDependency.order = await this.orderOopSystemService.updateOrder(lang, getOrder)

            //     await this.punishTicketOopSystemService.doingToDonePunishTicket(lang, ticket._id);
            //     payloadDependency.punish_ticket = null
            // }
            // new
            if(stepCancel.isPunishCollaborator === true && getGroupOrder.status !== STATUS_GROUP_ORDER.processing) {
                let collaborator = await this.collaboratorOopSystemService.getDetailItem(lang, getGroupOrder.id_collaborator);
                let timeInterval = await this.generalHandleService.calculateTimeInterval(getOrder.date_work, dateNow, "millisecond")
                timeInterval = Math.abs(timeInterval)
                let payload = {
                    id_collaborator: collaborator._id,
                    id_punish_policy: '',
                    id_order: getOrder._id,
                }
                if (timeInterval < 2 * MILLISECOND_IN_HOUR) {
                    payload.id_punish_policy = '6634662361c1079edc4cf069';
                } else if (timeInterval < 8 * MILLISECOND_IN_HOUR) {
                    payload.id_punish_policy = '6634664761c1079edc4cf09a';
                } else {
                    payload.id_punish_policy = '6634666f61c1079edc4cf0b6';
                }

                const newPayloadDependency = await this.punishTicketSystemService.createPunishTicket(lang, subjectAction, payload);
                const getPunishTicket = await this.punishTicketSystemService.executePunishTicket(lang, subjectAction, newPayloadDependency);

                // Cập nhật phiếu phạt vào trong đơn hàng
                const punishTicket = {
                    id_punish_ticket: getPunishTicket._id,
                    date_create: getPunishTicket.date_create,
                    execution_date: new Date().toISOString(),
                    revocation_date: null
                }
                getOrder.list_of_punish_ticket.push(punishTicket)
                getOrder.total_punish += getPunishTicket.punish_money
                getOrder.incurrence_time.push({ date_create: getPunishTicket.date_create, fee: getPunishTicket.punish_money })
                payloadDependency.order = await this.orderOopSystemService.updateOrder(lang, getOrder)
            }

            // 5 check xem co phat KH hay ko
            if(stepCancel.isPunishCustomer === true) {
                
            }

            // set trang thai don hang cho rieng CTV do
            if(payloadDependency.collaborator !== null) {
                const infoLinkedCollaborator = await this.setObjectInfoLinkedCollaborator(payloadDependency, STATUS_ORDER.cancel)
                if (subjectAction.type === "collaborator") {
                  this.orderOopSystemService.setMultiInfoLinkedCollaborator(payloadDependency.order, infoLinkedCollaborator)
                } else {
                  payloadDependency.order = await this.orderOopSystemService.setInfoLinkedCollaborator(payloadDependency.order, infoLinkedCollaborator)
                }
                
            }
            

            // 6. check xen co day CTV ra ko, hien tai khi day don se day ra tat ca ca lam cua dich vu do
            if(stepCancel.isUnassignCollaborator === true && getGroupOrder.status !== STATUS_GROUP_ORDER.processing) {
                // const infoLinkedCollaborator = await this.setObjectInfoLinkedCollaborator(payloadDependency, STATUS_ORDER.cancel)
                await Promise.all([
                    this.orderOopSystemService.multiUnassignCollaboratorOfGroupOrder(lang, subjectAction, payloadDependency),
                    this.groupOrderOopSystemService.unassignCollaborator(lang, getOrder.id_group_order),
                ])

                // do order duoc updateMany va dong bo nem


            }




            

            // 7. xu ly tru tien cho don tiep theo, 
            if(stepCancel.isMinusNextOrderCollaborator === true && getGroupOrder.status !== STATUS_GROUP_ORDER.processing) {
                const nextOrder = await this.orderOopSystemService.findNextOrderInGroupOrder(lang, idOrder);
                if(nextOrder && nextOrder.subtotal_fee === nextOrder.initial_fee) {
                    payloadDependency.order = nextOrder;
                    const minusFee = nextOrder.platform_fee + nextOrder.pending_money;
                    const collaborator = await this.collaboratorOopSystemService.getDetailItem(lang, nextOrder.id_collaborator)
                    const previousBalance = {
                        work_wallet: collaborator.work_wallet,
                        collaborator_wallet: collaborator.collaborator_wallet,
                    }
                    payloadDependency.collaborator = await this.collaboratorOopSystemService.minusCollaborator(lang, nextOrder.id_collaborator, minusFee, getGroupOrder.type, TYPE_ACTION.other)
                    await this.historyActivityOopSystemService.minusPlatformFee({type: "system", _id: null}, payloadDependency, minusFee, previousBalance)
                }
            }

            // 8. Huy transaction doi voi don hang co trang thai transaction la processing
            const getTransaction = await this.transactionOopSystemService.getDetailItemByIdGroupOrder(lang, getGroupOrder._id)
            if(getTransaction && getTransaction.status === STATUS_TRANSACTION.processing) {
                getTransaction.status = STATUS_TRANSACTION.cancel
                await this.transactionOopSystemService.updateTransaction(lang, getTransaction)
            }

            return true;
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);

        }
    }

    async getHistoryOrder(lang, iPage, user) {
        try {
            const getList = await this.orderOopSystemService.getListHistory(iPage, user._id)
            return getList;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getTotalIncomeByCollaborator(lang, iPage, collaborator) {
        try {
            const dataResult = await this.orderOopSystemService.getTotalIncome(iPage, collaborator._id)
            return dataResult
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    async getOrderNearActiveByCustomer(lang, iPage, subjectAction, idCustomer) {
        try {
            const getData = await this.orderOopSystemService.getListOrderNearActiveByCustomer(iPage, idCustomer)
            return getData;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    async setObjectInfoLinkedCollaborator(payloadDependency, status?) {
        try {
            const getOrder = payloadDependency.order
            const getCollaborator = payloadDependency.collaborator


            const infoLinkedCollaborator = {
                id_collaborator: getCollaborator._id,
                status: status
            }
            
            return infoLinkedCollaborator;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getListHistoryOrder(lang, subjectAction, iPage) {
        try {

            // const getList = await this.orderOopSystemService.get

            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getListOrder(lang, subjectAction, iPage, status) {
        try {

            // const getList = await this.orderOopSystemService.getListOrder(lang, subjectAction, iPage, status, sort)


        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getListOrderByCollaborator(lang, subjectAction, iPage) {
        try {
            const getList = await this.orderOopSystemService.getListOrder(lang, subjectAction, iPage, [STATUS_ORDER.confirm, STATUS_ORDER.doing], {date_work: 1})
            return getList;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getListOrderHistoryByCollaborator(lang, subjectAction, iPage) {
        try {
            const getList = await this.orderOopSystemService.getListOrder(lang, subjectAction, iPage, [STATUS_ORDER.done, STATUS_ORDER.cancel], {date_work: -1})
            return getList;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async checkOverlapOrderWhenCreating(lang, idCollaborator, lstDateWorkSchedule, total_estimate) {
        try {
            for (let i = 0; i < lstDateWorkSchedule.length; i++) {
                const endDateWork = new Date(new Date(lstDateWorkSchedule[i].date).getTime() + (total_estimate * 60 * 60 * 1000)).toISOString();
                const startTime = sub(new Date(lstDateWorkSchedule[i].date), { minutes: 30 }).toISOString();
                const endTime = add(new Date(endDateWork), { minutes: 30 }).toISOString();
                
                await this.orderOopSystemService.checkNumberOfConfirmOrder(lang, idCollaborator, startTime, endTime)
            }
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getInforOrder(lang, subjectAction, idOrder) {
        try {
            const [item, getCustomerSetting] = await Promise.all([
                this.orderOopSystemService.getInforOrder(lang, idOrder, subjectAction._id),
                this.settingOopSystemService.getCustomerSetting(lang)
            ])
            if (item.id_collaborator !== null) {
                item.id_collaborator.phone = await this.generalHandleService.formatHidePhone(item.id_collaborator.phone)
            }
            
            for (let i = 0; i < item.id_cancel_collaborator.length; i++) {
                const lengthPhone = item.id_cancel_collaborator[i]["id_collaborator"].phone.length - 2;
                const numberPhoneVisible = item.id_cancel_collaborator[i]["id_collaborator"].phone.slice(-3);
                let phoneHide = "";
                for (let i = 0; i < lengthPhone; i++) {
                    phoneHide += "*";
                }
                item.id_cancel_collaborator[i]["id_collaborator"].phone = phoneHide + numberPhoneVisible;
            }

            let type: any
            if(item.payment_method === PAYMENT_METHOD.cash || item.payment_method === PAYMENT_METHOD.point) {
                type = TYPE_RESPONSE_ORDER.none
            }
            if(item.payment_method === PAYMENT_METHOD.momo) {
                type = TYPE_RESPONSE_ORDER.deep_link
                
            }
            if(item.payment_method === PAYMENT_METHOD.vnpay || item.payment_method === PAYMENT_METHOD.vnbank || item.payment_method === PAYMENT_METHOD.intcard) {
                type = TYPE_RESPONSE_ORDER.url
            }

            let paymentInformation = getCustomerSetting.payment_method.find((e) => e.method === item.payment_method)
            if (paymentInformation) {
                item._doc['payment_method_name'] = {
                    vi: paymentInformation.title.vi,
                    en: paymentInformation.title.en,
                }
            }

            return { item, type };
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    // async editOrderNoChangePrice(lang, subjectAction, idOrder, payload: editOrderV2DTOAdmin) {
    //     try {
    //         const payloadDependency = {
    //             order: null,
    //             group_order: null,
    //             admin_action: null,
    //         }
    //         const dateNow = new Date(Date.now()).getTime();
    //         const getOrder = await this.orderOopSystemService.getDetailItem(lang, idOrder)

    //         const getGroupOrder = await this.groupOrderOopSystemService.getDetailItem(lang, getOrder.id_group_order)
    //         // if (new Date(getOrder.date_work).getTime() - dateNow < 0) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_OUTDATED, lang, null)], HttpStatus.NOT_FOUND);

    //         await this.orderOopSystemService.checkStatusOrder(getOrder, [STATUS_ORDER.cancel, STATUS_ORDER.doing, STATUS_ORDER.done], lang)

    //         ///////////////////////////////////////// check xem co trung gio khong ///////////////////////////////////////////////
    //         const checkTimeStart = sub(new Date(payload.date_work), { minutes: 30 }).toISOString();
    //         const checkTimeEnd = add(new Date(payload.end_date_work), { minutes: 30 }).toISOString();
    //         const queryOrder = {
    //             $and: [
    //                 { id_collaborator: getOrder.id_collaborator },
    //                 { status: { $in: ['confirm', 'doing'] } },
    //                 { _id: { $ne: getOrder._id } },
    //                 {
    //                     $or: [
    //                         { date_work: { $gt: checkTimeStart, $lt: checkTimeEnd } },
    //                         { end_date_work: { $gt: checkTimeStart, $lt: checkTimeEnd } },
    //                     ]
    //                 }
    //             ]
    //         }
    //         if (!payload.is_check_date_work) {
    //             queryOrder.$and.pop();
    //         }
    //         const getItem = await this.orderModel.find(queryOrder);
    //         if (payload.is_check_date_work && getItem.length > 0) throw new HttpException([await this.customExceptionService.i18nError(ERROR.TIME_OVERLAP, lang, null)], HttpStatus.BAD_REQUEST);
    //         ///// trên admin ko check trùng giờ
    //         const tempDate = getOrder.date_work;

    //         getOrder.date_work = payload.date_work;
    //         const end_date_work = addHours(new Date(payload.date_work), getOrder.total_estimate).toISOString();
    //         if (end_date_work.toString() !== payload.end_date_work.toString()) {
    //             payload.end_date_work = end_date_work;
    //         }
    //         getOrder.end_date_work = payload.end_date_work;
    //         for (let item of getGroupOrder.date_work_schedule) {
    //             if (item.date === tempDate) {
    //                 item.date = payload.date_work;
    //                 await getGroupOrder.save();
    //             }
    //         }
    //         await getOrder.save();

    //         // Cap nhat lai thu tu don hang
    //         await this.groupOrderOopSystemService.sortDateWorkSchedule(lang, getGroupOrder._id)
    //         // Cap nhat lai id view cua don hang
    //         await this.orderOopSystemService.updateOrderListOrdersByGroupOrder(getGroupOrder)
    //         // Lay don hang co dang giu phi dich vu va chuyen phi dich vu sang don hang khac
    //         await this.transferServiceFeeToAnotherOrder(lang, getGroupOrder._id)

    //         this.activityAdminSystemService.adminChangeDateWorkOrder(getOrder._id, admin._id);
    //         return true;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }

    async transferServiceFeeToAnotherOrder(lang, idGroupOrder) {
        try {
            let getOrderHasPendingMoney = await this.orderOopSystemService.getOrderHasPendingMoney(idGroupOrder)
            // Kiem tra _id bang _id cua don hang co ngay lam gan nhat hay khong
            // Neu khac thi se cap nhat lai phi dich vu cho don hang co ngay lam gan nhat 
            if (getOrderHasPendingMoney) {
                let getOrderWithTheLatestDateWork = await this.orderOopSystemService.getOrderWithTheLatestDateWork(idGroupOrder)
                if (getOrderWithTheLatestDateWork) {
                    if (getOrderHasPendingMoney._id.toString() !== getOrderWithTheLatestDateWork._id.toString()) {
                        getOrderWithTheLatestDateWork.pending_money = getOrderHasPendingMoney.pending_money
                        getOrderWithTheLatestDateWork.service_fee = getOrderHasPendingMoney.service_fee

                        getOrderHasPendingMoney.pending_money = 0
                        getOrderHasPendingMoney.service_fee = []

                        await Promise.all([
                            this.orderOopSystemService.updateOrder(lang, getOrderWithTheLatestDateWork),
                            this.orderOopSystemService.updateOrder(lang, getOrderHasPendingMoney),
                        ])
                    } 
                }
            }

            return true
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    async getOrderNearMe(lang, subjectAction, iPage: iPageOrderNearDTOCollaborator) {
        try {
            const [getCollaborator, getCollaboratorSetting] = await Promise.all([
                this.collaboratorOopSystemService.getDetailItem(lang, subjectAction._id),
                this.settingOopSystemService.getCustomerSetting(lang)
            ])
            return await this.orderOopSystemService.getListOrderNearMe(lang, iPage, getCollaborator, getCollaboratorSetting)
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    async getOrderFavourite(lang, subjectAction, iPage: iPageDTO) {
        try {
            const [getCollaborator, getCollaboratorSetting] = await Promise.all([
                this.collaboratorOopSystemService.getDetailItem(lang, subjectAction._id),
                this.settingOopSystemService.getCustomerSetting(lang)
            ])
            return await this.orderOopSystemService.getListOrderFavourite(lang, iPage, getCollaborator, getCollaboratorSetting)
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    async getOrderCity(lang, subjectAction, iPage: iPageDTO) {
        try {
            const [getCollaborator, getCollaboratorSetting] = await Promise.all([
                this.collaboratorOopSystemService.getDetailItem(lang, subjectAction._id),
                this.settingOopSystemService.getCustomerSetting(lang)
            ])
            return await this.orderOopSystemService.getListOrderCity(lang, iPage, getCollaborator, getCollaboratorSetting)
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async markCollaboratorCallToCustomer (lang, idOrder, idCollaborator) {
      try {
        const getOrder = await this.orderOopSystemService.getDetailItem(lang, idOrder)

        if (getOrder.id_collaborator && idCollaborator === getOrder.id_collaborator.toString()) {
          if (getOrder.status === STATUS_ORDER.confirm || getOrder === STATUS_ORDER.doing) {
            return await this.orderOopSystemService.setCallToCustomer(lang, idOrder)
          }    
        } else {
          throw new HttpException([await this.customExceptionService.i18nError(ERROR.COLLABORATOR.NOT_CONFIRM_THIS_ORDER, lang, null)], HttpStatus.NOT_FOUND)
        }

      } catch (err) {
        throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    async getListReviewsByCollaborator( idCollaborator, iPage: iPageReviewCollaboratorDTOCustomer) {
      try {
        
        return this.orderOopSystemService.getListReviewsByCollaborator( idCollaborator, iPage);

      } catch (err) {
        throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        
      }
    }

    async createReview(lang, subjectAction, idOrder, payload: createReviewDTOCustomer) {
        try {
            const payloadDependency = {
                customer: null, 
                order: null,
                group_order: null,
                collaborator: null
            }
            // 1. Kiem tra so sao danh gia co hop le khong
            if (payload.star <= 0)  {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.REVIEW_COLLABORATOR.THE_STAR_CANNOT_BE_LESS_THAN_0, lang, null)], HttpStatus.BAD_REQUEST);
            }

            if (payload.star > 5)  {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.REVIEW_COLLABORATOR.THE_STAR_CANNOT_BE_GREATER_5, lang, null)], HttpStatus.BAD_REQUEST);
            }

            // 2. Lay order, collaborator
            const [getCustomer, getOrder] = await Promise.all([
                this.customerOopSystemService.getDetailItem(lang, subjectAction._id),
                this.orderOopSystemService.getDetailItem(lang, idOrder)
            ])
            payloadDependency.customer = getCustomer
            const [getGroupOrder, getCollaborator] = await Promise.all([
                this.groupOrderOopSystemService.getDetailItem(lang, getOrder.id_group_order),
                this.collaboratorOopSystemService.getDetailItem(lang, getOrder.id_collaborator)
            ])
            payloadDependency.group_order = getGroupOrder

            if (subjectAction._id.toString() !== getOrder.id_customer.toString()) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.REVIEW_COLLABORATOR.CANNOT_REVIEW, lang, null)], HttpStatus.BAD_REQUEST);
            }
            
            // 3. Kiem tra trang thai order
            if (getOrder.status !== STATUS_ORDER.done) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.REVIEW_COLLABORATOR.CANNOT_REVIEW, lang, null)], HttpStatus.BAD_REQUEST);
            }
            if (getOrder.star !== 0) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.REVIEW_COLLABORATOR.CANNOT_REVIEW, lang, null)], HttpStatus.BAD_REQUEST);
            } 

            // 4. Kiem tra ngay danh gia
            const dateLimitReview = new Date(new Date(getOrder.end_date_work).setDate(new Date(getOrder.end_date_work).getDate() + 2))
            const currentDate = new Date().getTime();
            if (currentDate > dateLimitReview.getTime()) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.REVIEW_COLLABORATOR.CANNOT_REVIEW, lang, null)], HttpStatus.BAD_REQUEST);
            }

            // 5. Cap nhat danh gia cua don hang
            getOrder.review = payload.review || '';
            getOrder.star = payload.star;
            getOrder.date_create_review = new Date().toISOString();
            getOrder.is_hide = payload.is_hide || false;
            getOrder.short_review = payload.short_review || [];
            getOrder.status_handle_review = (payload.star > 3) ? "done" : "pending";
            
            payloadDependency.order = await this.orderOopSystemService.updateOrder(lang, getOrder)
            
            // 6. Cap nhat so sao cho doi tac
            getCollaborator.total_review += 1;
            getCollaborator.total_star += payload.star;
            let tempStar = 0;
            if (getCollaborator.total_review <= 5) {
                const temp = 5 - getCollaborator.total_review;
                tempStar = (getCollaborator.total_star + (temp * 5)) / (getCollaborator.total_review + temp);
            } else {
                tempStar = getCollaborator.total_star / getCollaborator.total_review
            }
            getCollaborator.star = Number(tempStar.toFixed(1));
            payloadDependency.collaborator = await this.collaboratorOopSystemService.updateCollaborator(lang, getCollaborator)

            await this.historyActivityOopSystemService.createReviewCollaboratorByCustomer(subjectAction, payloadDependency)
            
            if(+payload.star === 5) {
                const payload = {
                    id_reward_policy: "67d28c5555d8e1c6f1b9bfcc",
                    id_collaborator: getCollaborator._id,
                    id_order: getOrder._id
                }
                await this.executeRewardTicket(lang, subjectAction, payload)
            } else if (+payload.star < 5 && +payload.star > 0) {
                const payloadPunish = {
                    id_punish_ticket: "",
                    id_collaborator: getCollaborator._id,
                    id_order: getOrder._id
                }

                switch(+payload.star) {
                    case 1: {
                        payloadPunish.id_punish_ticket = ""
                        break
                    }
                    case 2: {
                        payloadPunish.id_punish_ticket = ""
                        break
                    }
                    case 3: {
                        payloadPunish.id_punish_ticket = ""
                        break
                    }
                    case 4: {
                        payloadPunish.id_punish_ticket = ""
                        break
                    }
                    default: {
                        break;
                    }
                }

                const newPayloadDependency = await this.punishTicketSystemService.createPunishTicket(lang, subjectAction, payload);
                const getPunishTicket = await this.punishTicketSystemService.executePunishTicket(lang, subjectAction, newPayloadDependency);

                  // Cập nhật phiếu phạt vào trong đơn hàng
                const punishTicket = {
                    id_punish_ticket: getPunishTicket._id,
                    date_create: getPunishTicket.date_create,
                    execution_date: new Date().toISOString(),
                    revocation_date: null
                }
                getOrder.list_of_punish_ticket.push(punishTicket)
                getOrder.total_punish += getPunishTicket.punish_money
                getOrder.incurrence_time.push({ date_create: getPunishTicket.date_create, fee: getPunishTicket.punish_money })
                payloadDependency.order = await this.orderOopSystemService.updateOrder(lang, getOrder)
            }

            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async executeRewardTicket(lang, subjectAction, payload) {
        try {
            const payloadDependency = await this.rewardTicketSystemService.createRewardTicket(lang, subjectAction, payload)
            await this.rewardTicketSystemService.executeRewardTicket(lang, subjectAction, payloadDependency)
            return true
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
