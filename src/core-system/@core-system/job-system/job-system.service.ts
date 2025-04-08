import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { nextFriday, nextMonday, nextSaturday, nextSunday, nextThursday, nextTuesday, nextWednesday } from 'date-fns'
import { ALLOWED_DURATION, ERROR, GlobalService, previousBalanceCollaboratorDTO, REFERRAL_MONEY } from 'src/@core'
import { createGroupOrderDTO, createGroupOrderDTOCustomer } from 'src/@core/dto/groupOrder.dto'
import { payloadDependencyDTO } from 'src/@core/dto/history.dto'
import { PAYMENT_METHOD, STATUS_ORDER, STATUS_TRANSACTION, TYPE_GROUP_ORDER, TYPE_RESPONSE_ORDER, TYPE_WALLET } from 'src/@repositories/module/mongodb/@database/enum'
import { TYPE_ACTION, TYPE_SUBJECT_ACTION, TYPE_USER_OBJECT } from 'src/@repositories/module/mongodb/@database/enum/base.enum'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service'
import { PushNotificationService } from 'src/@share-module/push-notification/push-notification.service'
import { CollaboratorOopSystemService } from 'src/core-system/@oop-system/collaborator-oop-system/collaborator-oop-system.service'
import { CustomerOopSystemService } from 'src/core-system/@oop-system/customer-oop-system/customer-oop-system.service'
import { ExtendOptionalOopSystemService } from 'src/core-system/@oop-system/extend-optional-oop-system/extend-optional-oop-system.service'
import { GroupOrderOopSystemService } from 'src/core-system/@oop-system/group-order-oop-system/group-order-oop-system.service'
import { HistoryActivityOopSystemService } from 'src/core-system/@oop-system/history-activity-oop-system/history-activity-oop-system.service'
import { NotificationOopSystemService } from 'src/core-system/@oop-system/notification-oop-system/notification-oop-system.service'
import { OptionalServiceOopSystemService } from 'src/core-system/@oop-system/optional-service-oop-system/optional-service-oop-system.service'
import { OrderOopSystemService } from 'src/core-system/@oop-system/order-oop-system/order-oop-system.service'
import { PromotionOopSystemService } from 'src/core-system/@oop-system/promotion-oop-system/promotion-oop-system.service'
import { ServiceFeeOopSystemService } from 'src/core-system/@oop-system/service-fee-oop-system/service-fee-oop-system.service'
import { ServiceOopSystemService } from 'src/core-system/@oop-system/service-oop-system/service-oop-system.service'
import { SettingOopSystemService } from 'src/core-system/@oop-system/setting-oop-system/setting-oop-system.service'
import { TransactionOopSystemService } from 'src/core-system/@oop-system/transaction-oop-system/transaction-oop-system.service'
import { UserSystemOoopSystemService } from 'src/core-system/@oop-system/user-system-ooop-system/user-system-ooop-system.service'
import { GroupOrderSystemService2 } from '../group-order-system/group-order-system.service'
import { NotificationSystemService } from '../notification-system/notification-system.service'
import { OrderSystemService2 } from '../order-system/order-system.service'
import { PaymentSystemService } from '../payment-system/payment-system.service'
import { RewardTicketSystemService } from '../reward-ticket-system/reward-ticket-system.service'

@Injectable()
export class JobSystemService {

    constructor(
        private customExceptionService: CustomExceptionService,
        private generalHandleService: GeneralHandleService,
        private globalService: GlobalService,

        private groupOrderOopSystemService: GroupOrderOopSystemService,
        private orderOopSystemService: OrderOopSystemService,
        private collaboratorOopSystemService: CollaboratorOopSystemService,
        private userSystemOoopSystemService: UserSystemOoopSystemService,
        private historyActivityOopSystemService: HistoryActivityOopSystemService,
        private customerOopSystemService: CustomerOopSystemService,
        private settingOopSystemService: SettingOopSystemService,

        private notificationOopSystemService: NotificationOopSystemService,
        
        private notificationSystemService: NotificationSystemService,
        private paymentSystemService: PaymentSystemService,
        private transactionOopSystemService: TransactionOopSystemService,
        private orderSystemService: OrderSystemService2,
        private rewardTicketSystemService: RewardTicketSystemService,
        // private groupOrderSystemService: GroupOrderSystemService, // old

        private pushNotificationService: PushNotificationService,
        private serviceOopSystemService: ServiceOopSystemService,

        private extendOptionalOopSystemService: ExtendOptionalOopSystemService,
        private optionalServiceOopSystemService: OptionalServiceOopSystemService,
        private serviceFeeOopSystemService: ServiceFeeOopSystemService,
        private promotionOopSystemService: PromotionOopSystemService,
        private groupOrderSystemService2: GroupOrderSystemService2,

    ){}


    async cancelOrder(lang, subjectAction, idOrder, idCancel) {
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

            return await this.orderSystemService.cancelOrder(lang, subjectAction, idOrder, idCancel, stepCancel)

        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    // async pendingToConfirm(lang, idOrder, idCollaborator, subjectAction, checkTime?){
    //     try {
    //         // 1. Check order va group order co ton tai hay khong
    //         let getOrder = await this.orderOopSystemService.getDetailItem(lang, idOrder)

    //         let getGroupOrder = await this.groupOrderOopSystemService.getDetailItem(lang, getOrder.id_group_order);

    //         let getCustomer = await this.customerOopSystemService.getDetailItem(lang, getOrder.id_customer)

    //         const payloadDependency = {
    //             order: getOrder,
    //             group_order: getGroupOrder,
    //             collaborator: null,
    //             admin_action: null,
    //         }

    //         if (subjectAction.type === TYPE_SUBJECT_ACTION.admin) {
    //             const getUser = await this.userSystemOoopSystemService.getDetailItem(lang, subjectAction._id)
    //             payloadDependency.admin_action = getUser
    //         }

    //         // 2. Check don hang co nguoi nao nhan chua
    //         await this.orderOopSystemService.checkStatusOrder(getOrder, [STATUS_ORDER.cancel, STATUS_ORDER.doing, STATUS_ORDER.done, STATUS_ORDER.confirm], lang)

    //         // 3. Check xem CTV co bi chan hay khong
    //         let getCollaborator = await this.collaboratorOopSystemService.getDetailItem(lang, idCollaborator)

    //         const checkBlockCollaborator = getOrder.id_block_collaborator.includes(getCollaborator._id);
    //         if (checkBlockCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.CUSTOMER_BLOCK_COLLABORATOR, lang, null)], HttpStatus.NOT_FOUND);

    //         // 4. Check xem co trung gio cua cac ca khac khong
    //         if (checkTime) await this.checkOverlapOrder(getCollaborator._id, getGroupOrder._id, lang);

    //         // 4. Check doi tac da tung huy don chua
    //         let checkCancelCollaborator = getOrder.id_cancel_collaborator.find((e) => e["id_collaborator"].toString() === getCollaborator._id.toString())

    //         if (checkCancelCollaborator && !payloadDependency.admin_action) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_CANCELED_BY_COLLABORATOR, lang, null)], HttpStatus.NOT_FOUND);
            
    //         // 5. Thu phi cua CTV
    //             const chargeFee = getOrder.final_fee;
    //             const previousBalance: previousBalanceCollaboratorDTO = {
    //                 work_wallet: getCollaborator.work_wallet,
    //                 collaborator_wallet: getCollaborator.collaborator_wallet
    //             }
    //         if(getOrder.payment_method === PAYMENT_METHOD.cash) {

    //             getCollaborator = await this.collaboratorOopSystemService.minusCollaborator(lang, idCollaborator, chargeFee)
    //             payloadDependency.collaborator = getCollaborator
    //             // 7. Log he thong va ban thong bao tru tien
    //             await this.historyActivityOopSystemService.minusPlatformFee(subjectAction, payloadDependency, chargeFee, previousBalance)
    //             await this.notificationSystemService.minusPlatformFee(lang, getGroupOrder._id, getOrder, getCollaborator, chargeFee)
    //         }


    //         // 6. Gan don cho CTV
    //         if (getGroupOrder.type === TYPE_GROUP_ORDER.schedule) {
    //             await this.orderOopSystemService.assignCollaboratorByGroupOrder(getGroupOrder._id, getCollaborator)

    //             getGroupOrder = await this.groupOrderOopSystemService.assignCollaborator(lang, getGroupOrder._id, getCollaborator)
    //         } else {
    //             getGroupOrder = await this.groupOrderOopSystemService.assignCollaborator(lang, getGroupOrder._id, getCollaborator, false)
                
    //             getOrder = await this.orderOopSystemService.assignCollaborator(lang, getOrder._id, getCollaborator)
    //         }


    //         // 6. log he thong va ban thong bao xac nhan don
    //         await this.historyActivityOopSystemService.confirmOrder(subjectAction, payloadDependency, previousBalance)
    //         await this.notificationSystemService.confirmOrder(lang, getGroupOrder._id, getOrder, getCustomer, getCollaborator)

            
    //         // if(getOrder.payment_method === PAYMENT_METHOD.cash) {
    //         //     await this.historyActivityOopSystemService.minusPlatformFee(subjectAction, payloadDependency, chargeFee, previousBalance)
    //         //     await this.notificationSystemService.minusPlatformFee(lang, getGroupOrder._id, getOrder, getCollaborator, chargeFee)
    //         // }
    //         return getOrder;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    //     }
    // }

    async pendingToConfirm(lang, subjectAction, idOrder, idCollaborator, checkTime?) {
        try {
            // 1. Check order va group order co ton tai hay khong
                
            let getOrder = await this.orderOopSystemService.getDetailItem(lang, idOrder)
            let [getGroupOrder, getCustomer, getCollaborator] = await Promise.all([
                this.groupOrderOopSystemService.getDetailItem(lang, getOrder.id_group_order),
                this.customerOopSystemService.getDetailItem(lang, getOrder.id_customer),
                this.collaboratorOopSystemService.getDetailItem(lang, idCollaborator),
            ])

            let payloadDependency = {
                order: getOrder,
                group_order: getGroupOrder,
                collaborator: null,
                admin_action: null,
            }

            if (subjectAction.type === TYPE_SUBJECT_ACTION.admin) {
                const getUser = await this.userSystemOoopSystemService.getDetailItem(lang, subjectAction._id)
                payloadDependency.admin_action = getUser
            }

            // Kiem tra don hang da co nguoi nhan hay chua
            if(getOrder.id_collaborator !== null && getOrder.id_collaborator !== undefined && subjectAction.type !== TYPE_SUBJECT_ACTION.admin) {
                if(getOrder.id_collaborator.toString() === idCollaborator.toString()) {
<<<<<<< HEAD
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.YOU_CONFIRMED_THIS_ORDER, lang, null)], HttpStatus.NOT_FOUND);
                }
                if(getOrder.id_collaborator.toString() !== idCollaborator.toString()) {
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_CONFIRMED, lang, null)], HttpStatus.NOT_FOUND);
=======
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.YOU_CONFIRMED_THIS_ORDER, lang, null)], HttpStatus.BAD_REQUEST);
                }
                if(getOrder.id_collaborator.toString() !== idCollaborator.toString()) {
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_CONFIRMED, lang, null)], HttpStatus.BAD_REQUEST);
>>>>>>> son
                }
            }

            // 2. Check don hang co bi duplicate goi lai trang thai khong
            await this.orderOopSystemService.checkStatusOrder(getOrder, [STATUS_ORDER.cancel, STATUS_ORDER.doing, STATUS_ORDER.done, STATUS_ORDER.confirm], lang)

            // 3. Check xem CTV co bi chan hay khong
        
            // Kiem tra tien trong vi nap (work_wallet)
            // Neu la don chuyen khoan kiem tra work_wallet co lon hon bang so tien toi thieu khong
            // Neu la don tien mat kiem tra work_wallet co lon hon hoac bang so tien don khong
            // if(getOrder.payment_method === PAYMENT_METHOD.cash) {
            //     if(getOrder.final_fee > getCollaborator.work_wallet) {
            //         if(subjectAction.type === TYPE_SUBJECT_ACTION.admin) {
            //             throw new HttpException([await this.customExceptionService.i18nError(ERROR.ADMIN_COLLABORATOR_NOT_ENOUGH_REMAINDER, lang, null)], HttpStatus.NOT_FOUND);
            //         } 
                    
            //         if(subjectAction.type === TYPE_SUBJECT_ACTION.collaborator) {
            //             throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_ENOUGH_MONEY, lang, null)], HttpStatus.NOT_FOUND);
            //         }
                    
            //         const remainingMoney = getCollaborator.work_wallet - getOrder.final_fee
            //         if(remainingMoney < getCollaboratorSetting.minimum_work_wallet) {
            //             throw new HttpException([await this.customExceptionService.i18nError(ERROR.WORK_WALLET_MUST_BE_THAN_minimum_work_wallet, lang, null, { minimum_work_wallet: getCollaboratorSetting.minimum_work_wallet})], HttpStatus.NOT_FOUND);
            //         }
            //     }
            // } else {
            //     if(getCollaborator.work_wallet < getCollaboratorSetting.minimum_work_wallet) {
            //         throw new HttpException([await this.customExceptionService.i18nError(ERROR.WORK_WALLET_MUST_BE_THAN_minimum_work_wallet, lang, null, { minimum_work_wallet: getCollaboratorSetting.minimum_work_wallet})], HttpStatus.NOT_FOUND);
            //     }
            // }

            payloadDependency.collaborator = getCollaborator;
            const checkBlockCollaborator = getOrder.id_block_collaborator.includes(getCollaborator._id);
            if (checkBlockCollaborator) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.CUSTOMER_BLOCK_COLLABORATOR, lang, null)], HttpStatus.NOT_FOUND);
            }
            
            // 4. Check xem co trung gio cua cac ca khac khong
            if (checkTime) {
                await this.checkOverlapOrder(lang, getCollaborator._id, getGroupOrder._id); 
            } else {
                if(subjectAction.type === TYPE_SUBJECT_ACTION.admin) {
                    // Ghi log QTV cho phep trung don
                    await this.historyActivityOopSystemService.allowConfirmingDuplicateOrder(subjectAction, payloadDependency)
                }
            }

            // 5. Check doi tac da tung huy don chua
            let checkCancelCollaborator = getOrder.id_cancel_collaborator.find((e) => e?.id_collaborator && e.id_collaborator.toString() === getCollaborator._id.toString())
            if (checkCancelCollaborator && !payloadDependency.admin_action) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_CANCELED_BY_COLLABORATOR, lang, null)], HttpStatus.NOT_FOUND);
            }

            // 6. Thu phi cua CTV
            payloadDependency = await this.minusFeeOrderByCollaborator(lang, subjectAction, payloadDependency);

            // 7. Gan don cho CTV
            payloadDependency = await this.assignCollaborator(lang, subjectAction, payloadDependency)

             // 8. log he thong va ban thong bao xac nhan don
            // await this.historyActivityOopSystemService.confirmOrder(subjectAction, payloadDependency)
            await this.notificationSystemService.confirmOrder(lang, getGroupOrder._id, getOrder, getCustomer, getCollaborator)

            return getOrder;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async confirmToDoing(lang, idOrder, idCollaborator, subjectAction) {
        try {
            // 1. Check order va group order co ton tai hay khong, sau do kiem tra trang thai
            let getOrder = await this.orderOopSystemService.getDetailItem(lang, idOrder)
            await this.orderOopSystemService.checkStatusOrder(getOrder, [STATUS_ORDER.cancel, STATUS_ORDER.pending, STATUS_ORDER.done, STATUS_ORDER.doing], lang)
            
            // Kiểm tra idCollaborator và id_collaborator có trùng nhau không
            // Nếu không thì báo lỗi
            if(idCollaborator.toString() !== getOrder.id_collaborator.toString()) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.COLLABORATOR.CANNOT_START_THIS_SHIFT, lang, null)], HttpStatus.FORBIDDEN);
            }

            let getGroupOrder = await this.groupOrderOopSystemService.getDetailItem(lang, getOrder.id_group_order);

            let getCustomer = await this.customerOopSystemService.getDetailItem(lang, getOrder.id_customer)

            // 2. Lay thong tin CTV 
            const getCollaborator = await this.collaboratorOopSystemService.getDetailItem(lang, idCollaborator)

            const payloadDependency = {
                order: getOrder,
                group_order: getGroupOrder,
                collaborator: getCollaborator,
                admin_action: null,
            }

            if (subjectAction.type === TYPE_SUBJECT_ACTION.admin) {
                const getUser = await this.userSystemOoopSystemService.getDetailItem(lang, subjectAction._id)
                payloadDependency.admin_action = getUser
            }

            // 3. Kiem tra CTV co ca nao chua hoan thanh hay khong
            await this.orderOopSystemService.checkForDoingOrdersOfCollaborator(lang, getOrder, getCollaborator._id, )

            // 4. Check da den gio bat dau lam cong viec hay chua (truoc 15p)
            if(subjectAction.type === TYPE_SUBJECT_ACTION.collaborator) {
                const dateWork = new Date(getOrder.date_work).getTime();
                const dateNow = new Date().getTime();
                if ((dateWork - dateNow) > ALLOWED_DURATION) {
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.COLLABORATOR.NOT_YET_TIME_WORK, lang, null)], HttpStatus.FORBIDDEN);
                }
            }

            // 5. Chuyen trang thai cua order va group order
            getOrder = await this.orderOopSystemService.changeStatus(lang, getOrder._id, STATUS_ORDER.doing)
            await this.groupOrderOopSystemService.changeStatus(lang, getGroupOrder._id, STATUS_ORDER.doing)

            // 6. Log he thong
            await this.historyActivityOopSystemService.doingOrder(subjectAction, payloadDependency)

            // 7. Tao va ban thong bao
            await this.notificationSystemService.doingOrder(lang, getGroupOrder._id, getOrder, getCustomer, getCollaborator)

            if(subjectAction.type === TYPE_SUBJECT_ACTION.collaborator) {
                // Kiểm tra thời gian bắt đầu làm việc có nằm trong khoảng được cộng thưởng hay không
                // let durationStartWork = new Date(getOrder.date_work).getTime() - new Date(getOrder.work_start_date).getTime()

                // if(durationStartWork <= 0 && durationStartWork > -960000) {
                    const payload = {
                        id_reward_policy: "67d28c5555d8e1c6f1b9bfb7",
                        id_collaborator: getOrder.id_collaborator,
                        id_order: getOrder._id
                    }
                    await this.executeRewardTicket(lang, subjectAction, payload)
                // }
            }
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }



    // async doingToDone(lang, idOrder, idCollaborator, subjectAction) {
    //     try {
    //         // 1. Check order co ton tai hay khong, sau do kiem tra trang thai
    //         let getOrder = await this.orderOopSystemService.getDetailItem(lang, idOrder)
    //         await this.orderOopSystemService.checkStatusOrder(getOrder, [STATUS_ORDER.cancel, STATUS_ORDER.pending, STATUS_ORDER.done, STATUS_ORDER.confirm], lang)

    //         // 2. Check da den gio hoan thanh cong viec hay chua (truoc 15p)
    //         const dateWork = new Date(getOrder.end_date_work).getTime();
    //         const dateNow = new Date().getTime();

    //         if (dateWork - dateNow > ALLOWED_DURATION) {
    //             throw new HttpException([await this.customExceptionService.i18nError(ERROR.COLLABORATOR.NOT_TIME_TO_COMPLETE_YET, lang, null)], HttpStatus.FORBIDDEN);
    //         } 

    //         // 3. Lay thong tin group order, customer va customer setting
    //         let [getGroupOrder, getCustomer, getCustomerSetting] = await Promise.all([
    //             this.groupOrderOopSystemService.getDetailItem(lang, getOrder.id_group_order),
    //             this.customerOopSystemService.getDetailItem(lang, getOrder.id_customer), 
    //             this.settingOopSystemService.getCustomerSetting(lang)
    //         ])

    //         const payloadDependency = {
    //             order: null,
    //             group_order: getGroupOrder,
    //             collaborator: null,
    //             customer: null,
    //             inviter: null,
    //             admin_action: null,
    //         }

    //         if (subjectAction.type === TYPE_SUBJECT_ACTION.admin) {
    //             const getUser = await this.userSystemOoopSystemService.getDetailItem(lang, subjectAction._id)
    //             payloadDependency.admin_action = getUser
    //         }

    //         const doneOrders = await this.orderOopSystemService.countDoneOrdersByCustomer(getOrder.id_customer)

    //         // 4. Chuyen trang thai order
    //         payloadDependency.order = await this.orderOopSystemService.changeStatus(lang, getOrder._id, STATUS_ORDER.done)

    //         // 5. Tinh tien cac loai phi trong group order
    //         await this.groupOrderOopSystemService.updateFeeAndMoneyInGroupOrder(lang, getGroupOrder._id, getOrder)

    //         // 6. Cong diem vào G-point cho khach hang
    //         const previousBalancePoints = {
    //             point: getCustomer.point
    //         }

    //         const currentPoint = Math.floor(+getOrder.final_fee / +getCustomerSetting.point_to_price);
    //         const resultAddPoint = await this.customerOopSystemService.addPointsWhenDoneOrder(lang, +getOrder.final_fee, currentPoint, getCustomer._id, getCustomerSetting)

    //         payloadDependency.customer = resultAddPoint.getCustomer

    //         // 7. Cong thuong tien cho nguoi gioi thieu
    //         await this.addPayPointsForInviter(lang, getCustomer, subjectAction)

    //         // 8. Cong tien vao vi cho CTV
    //         let getCollaborator = await this.collaboratorOopSystemService.getDetailItem(lang, idCollaborator)

    //         let refundMoney = 0
    //         const previousBalance: previousBalanceCollaboratorDTO = {
    //             collaborator_wallet: getCollaborator.collaborator_wallet,
    //             work_wallet: getCollaborator.work_wallet,
    //         }

    //         // if (getOrder.payment_method === PAYMENT_METHOD.cash) {
    //         //     payloadDependency.collaborator = await this.collaboratorOopSystemService.refundCollaborator(lang, idCollaborator, TYPE_WALLET.collaborator_wallet, getOrder.refund_money)
    //         //     refundMoney = getOrder.refund_money
    //         // } else {
    //         //     payloadDependency.collaborator =  await this.collaboratorOopSystemService.refundCollaborator(lang, idCollaborator, TYPE_WALLET.collaborator_wallet, getOrder.final_fee + getOrder.refund_money)
    //         //     refundMoney = getOrder.final_fee + getOrder.refund_money
    //         // }
    //         refundMoney = getOrder.shift_income; // doi tac nhan so tien thuc nhan cua ca, thay vi nhan so tien chenh lech



    //         // 9. Tru tien cho don hang tiep theo, neu la don hang co dinh
    //         if (getGroupOrder.type === TYPE_GROUP_ORDER.schedule) {
    //             await this.handleNextOrder(lang, getOrder._id, getGroupOrder, idCollaborator)
    //         } else {
    //             // Cap nhat trang thai cua group order
    //             await this.groupOrderOopSystemService.changeStatus(lang, getGroupOrder._id, STATUS_ORDER.done)
    //         }

    //         // Xac thanh toan qua momo
    //         if (getGroupOrder.type !== TYPE_GROUP_ORDER.schedule && payloadDependency.order.payment_method === PAYMENT_METHOD.momo) {
    //             const payloadMomo = {
    //                 id_order: payloadDependency.order._id,
    //                 money: payloadDependency.order.final_fee
    //             }
    //             await this.paymentSystemService.confirmPayment(lang, payloadMomo, true)
    //         }

    //         // 10. Log he thong
    //         await this.historyActivityOopSystemService.receiveRefundMoney(subjectAction, payloadDependency, previousBalance, refundMoney)
    //         await this.historyActivityOopSystemService.doneOrder(subjectAction, payloadDependency, previousBalance)
    //         await this.historyActivityOopSystemService.addPointForCustomerWhenDoneOrder(subjectAction, payloadDependency, previousBalancePoints, currentPoint)

    //         // 11. Tao va ban thong bao
    //         await this.notificationSystemService.doneOrder(lang, getGroupOrder._id, getOrder, resultAddPoint.getCustomer, getCollaborator),
    //         await this.notificationSystemService.addPoint(lang, getOrder, resultAddPoint.getCustomer, resultAddPoint.accumulatePoints),
    //         await this.notificationSystemService.receiveRefundMoney(lang, getGroupOrder._id, getOrder, getCollaborator, refundMoney)

    //         return getOrder
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    //     }
    // }

    async doingToDone(lang, idOrder, idCollaborator, subjectAction) {
        try {
            let payloadDependency: payloadDependencyDTO = {
                order: null,
                group_order: null,
                collaborator: null,
                customer: null,
                inviter: null,
                admin_action: null
            }
            
            // 1. Check order co ton tai hay khong, sau do kiem tra trang thai
            let getOrder = await this.orderOopSystemService.getDetailItem(lang, idOrder)
            await this.orderOopSystemService.checkStatusOrder(getOrder, [STATUS_ORDER.cancel, STATUS_ORDER.pending, STATUS_ORDER.done, STATUS_ORDER.confirm], lang)

            // Kiểm tra idCollaborator và id_collaborator có trùng nhau không
            // Nếu không thì báo lỗi
            if(idCollaborator.toString() !== getOrder.id_collaborator.toString()) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.COLLABORATOR.CANNOT_FINISH_THIS_SHIFT, lang, null)], HttpStatus.FORBIDDEN);
            }

            // 2. Check da den gio hoan thanh cong viec hay chua (truoc 15p)
<<<<<<< HEAD
            if(subjectAction.type === TYPE_SUBJECT_ACTION.collaborator) {
                const dateWork = new Date(getOrder.end_date_work).getTime();
                const dateNow = new Date().getTime();
                if ((dateWork - dateNow) > ALLOWED_DURATION) {
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.COLLABORATOR.NOT_TIME_TO_COMPLETE_YET, lang, null)], HttpStatus.FORBIDDEN);
                }
            }
=======
            // if(subjectAction.type === TYPE_SUBJECT_ACTION.collaborator) {
            //     const dateWork = new Date(getOrder.end_date_work).getTime();
            //     const dateNow = new Date().getTime();
            //     if ((dateWork - dateNow) > ALLOWED_DURATION) {
            //         throw new HttpException([await this.customExceptionService.i18nError(ERROR.COLLABORATOR.NOT_TIME_TO_COMPLETE_YET, lang, null)], HttpStatus.FORBIDDEN);
            //     }
            // }
>>>>>>> son
            

            // 3. Lay thong tin group order, customer va customer setting
            let [getGroupOrder, getCustomer, getCustomerSetting, getCollaborator] = await Promise.all([
                this.groupOrderOopSystemService.getDetailItem(lang, getOrder.id_group_order),
                this.customerOopSystemService.getDetailItem(lang, getOrder.id_customer),
                this.settingOopSystemService.getCustomerSetting(lang),
                this.collaboratorOopSystemService.getDetailItem(lang, idCollaborator),
            ])

            payloadDependency.group_order = getGroupOrder;
            payloadDependency.customer = getCustomer;
            payloadDependency.order = getOrder;
            payloadDependency.collaborator = getCollaborator;

            if (subjectAction.type === TYPE_SUBJECT_ACTION.admin) {
                const getUser = await this.userSystemOoopSystemService.getDetailItem(lang, subjectAction._id)
                payloadDependency.admin_action = getUser
            }

            const doneOrders = await this.orderOopSystemService.countOrdersByCustomer(getOrder.id_customer, STATUS_ORDER.done)

            // 4. Chuyen trang thai order
            // luu trang thai don hang cho CTV
            const infoLinkedCollaborator = await this.orderSystemService.setObjectInfoLinkedCollaborator(payloadDependency, STATUS_ORDER.done)

            payloadDependency.order = await this.orderOopSystemService.changeStatus(lang, getOrder._id, STATUS_ORDER.done, infoLinkedCollaborator)
            await this.historyActivityOopSystemService.doneOrder(subjectAction, payloadDependency)
            await this.notificationSystemService.doneOrder(lang, getGroupOrder._id, getOrder, getCustomer, getCollaborator),

            // 5. Tinh tien cac loai phi trong group order
            await this.groupOrderOopSystemService.updateFeeAndMoneyInGroupOrder(lang, getGroupOrder._id, getOrder)

            // 6. Cong diem vào G-point cho khach hang
            const previousBalancePoints = {
                point: getCustomer.point
            }

            const currentPoint = Math.floor(+getOrder.final_fee / +getCustomerSetting.point_to_price);
            const resultAddPoint = await this.customerOopSystemService.addPointsWhenDoneOrder(lang, +getOrder.final_fee, currentPoint, getCustomer._id, getCustomerSetting)
            await this.historyActivityOopSystemService.addPointForCustomerWhenDoneOrder(subjectAction, payloadDependency, previousBalancePoints, currentPoint)
            await this.notificationSystemService.addPoint(lang, getOrder, resultAddPoint.getCustomer, resultAddPoint.accumulatePoints),
            payloadDependency.customer = resultAddPoint.getCustomer

            // 7. Cong thuong tien cho nguoi gioi thieu
            await this.addPayPointsForInviterNew(lang, getCustomer, subjectAction)

            // 8. Tru them tien thu ho (vi CTV)
            if(getOrder.remaining_shift_deposit > 0 && getOrder.payment_method === PAYMENT_METHOD.cash) {
                payloadDependency = await this.minusRemainingShiftDeposit(lang, subjectAction, payloadDependency)
            }

            // 9. Cong tien vao vi cho CTV
            payloadDependency = await this.refundMoneyWhenCompletingOrder(lang, subjectAction, payloadDependency)

            // 10. Cong tien cho affiliate
            if(getCustomer?.id_customer_referrer) {
                await this.addAPointForReferrerPerson(lang, subjectAction, payloadDependency, getCustomerSetting, doneOrders)
            }

            // 11. Tru tien cho don hang tiep theo, neu la don hang co dinh
            payloadDependency = await this.handleNextOrder(lang, subjectAction, payloadDependency)

            // // Xac thanh toan qua momo
            // if (getGroupOrder.type !== TYPE_GROUP_ORDER.schedule && payloadDependency.order.payment_method === PAYMENT_METHOD.momo) {
            //     const payloadMomo = {
            //         id_order: payloadDependency.order._id,
            //         money: payloadDependency.order.final_fee
            //     }
            //     await this.paymentSystemService.confirmPayment(lang, payloadMomo, true)
            // }

            // 12. Tạo đơn tiếp theo là đơn lặp lại
            if(getGroupOrder.type === TYPE_GROUP_ORDER.loop && getGroupOrder.is_auto_order) {
                await this.createLoopGroupOrder(lang, getGroupOrder)
            }

            if(subjectAction.type === TYPE_SUBJECT_ACTION.collaborator) {
                // Kiểm tra thời gian bắt đầu làm việc có nằm trong khoảng được cộng thưởng hay không
                // let durationEndWork = new Date(getOrder.end_date_work).getTime() - new Date(getOrder.completion_date).getTime()

                // if(durationEndWork <= 0 && durationEndWork > -960000) {
                    const payload = {
                        id_reward_policy: "67d28c5555d8e1c6f1b9bfc5",
                        id_collaborator: getOrder.id_collaborator,
                        id_order: getOrder._id
                    }
                    await this.executeRewardTicket(lang, subjectAction, payload)
                // }
            }

            // Cộng điểm hoàn thành ca làm
            if(getOrder.is_rush_time) {
                const payload = {
                    id_reward_policy: "67d919fd4c19d2c0b9acad0a",
                    id_collaborator: getOrder.id_collaborator,
                    id_order: getOrder._id
                }
                await this.executeRewardTicket(lang, subjectAction, payload)
            } else {
                const payload = {
                    id_reward_policy: "67d28c5555d8e1c6f1b9bfbe",
                    id_collaborator: getOrder.id_collaborator,
                    id_order: getOrder._id
                }
                await this.executeRewardTicket(lang, subjectAction, payload)
            }

            return true
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // async handleNextOrder(lang, idOrder, groupOrder, idCollaborator) {
    //     try {
    //     let nextOrder = await this.orderOopSystemService.findNextOrderInGroupOrder(lang, idOrder)
    //     let minusPlatformFeeNoti:any
    //     const payloadDependency = {
    //         collaborator: null,
    //         order: null
    //     }
    //     if (nextOrder) {
    //         let minusFee = 0;
    //         // const minusFee = nextOrder.platform_fee + nextOrder.pending_money
    //         if(nextOrder.final_fee === nextOrder.subtotal_fee) {
    //             minusFee = nextOrder.platform_fee + nextOrder.pending_money
    //         } else {
    //             if(nextOrder.payment_method === 'cash') {
    //                 minusFee = nextOrder.final_fee
    //             }
    //         }


    //         // Kiểm tra idCollaborator === nextOrder.id_collaborator hay không
    //         // Nếu bằng nhau thì trừ collaborator_wallet của collaborator
    //         // Nếu không bằng nhau thì không trừ tiền (không làm gì hết) (vì khi nhận đơn hàng pendingToConfirm đã trừ tiền lúc đó rồi)
    //         if (idCollaborator.toString() === nextOrder.id_collaborator.toString()) {
    //             const collaborator = await this.collaboratorOopSystemService.getDetailItem(lang, nextOrder.id_collaborator)
    //             const previousBalanceForNextOrder: previousBalanceCollaboratorDTO = {
    //                 collaborator_wallet: collaborator.collaborator_wallet,
    //                 work_wallet: collaborator.work_wallet,
    //             }
    
    //             if(minusFee > 0) {
    //             // Trừ tiền collaborator_wallet cua CTV
    //             payloadDependency.collaborator = await this.collaboratorOopSystemService.deductMoney(lang, nextOrder.id_collaborator, minusFee)
    //             payloadDependency.order = nextOrder
    
    //             // Log lại lịch sử thu tiền của đơn hàng tiếp theo
    //             await this.historyActivityOopSystemService.minusPlatformFee({type: "system", _id: null}, payloadDependency, minusFee, previousBalanceForNextOrder)

    //             // Tao va ban thong bao
    //             await this.notificationSystemService.minusPlatformFee(lang, groupOrder._id, nextOrder, payloadDependency.collaborator, minusFee)
    //             }
    //         }

    //         // Cập nhật is_duplicate cho đơn hàng hiện tại và đơn hàng tiếp theo
    //         await this.orderOopSystemService.updateIsDuplicate(lang, nextOrder._id, false)
    //         await this.orderOopSystemService.updateIsDuplicate(lang, idOrder, true)

    //         // Cập nhật trạng thái của group order theo trạng thái của đơn hàng tiếp theo
    //         await this.groupOrderOopSystemService.changeStatus(lang, groupOrder._id, STATUS_ORDER.confirm)
    //     } else {
    //         // Cập nhật trạng thái của group order
    //         await this.groupOrderOopSystemService.changeStatus(lang, groupOrder._id, STATUS_ORDER.done)
    //     }

    //     return true

    // } catch(err) {
    //     throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    //     }
    // }

    async handleNextOrder(lang, subjectAction, payloadDependency) {
        try {
            const getOrder = payloadDependency.order;
            let getNextOrder = null;
            let getGroupOrder = payloadDependency.group_order;
            const getCollaborator = payloadDependency.collaborator
            getNextOrder = await this.orderOopSystemService.findNextOrderInGroupOrder(lang, getOrder._id);

            if (getNextOrder) {
                payloadDependency.order = getNextOrder
                // Kiểm tra idCollaborator === nextOrder.id_collaborator hay không
                // Nếu bằng nhau thì trừ collaborator_wallet của collaborator
                // Nếu không bằng nhau thì không trừ tiền (không làm gì hết) (vì khi nhận đơn hàng pendingToConfirm đã trừ tiền lúc đó rồi)
                if (getCollaborator._id.toString() === getNextOrder.id_collaborator.toString()) {
                    await this.minusFeeOrderByCollaborator(lang, subjectAction, payloadDependency);
                }
                // Cập nhật is_duplicate cho đơn hàng hiện tại và đơn hàng tiếp theo
                await this.orderOopSystemService.updateIsDuplicate(lang, getNextOrder._id, false)
                await this.orderOopSystemService.updateIsDuplicate(lang, getOrder, true)

                getGroupOrder = await this.groupOrderOopSystemService.changeStatus(lang, getGroupOrder._id, STATUS_ORDER.confirm)
            } else {
                // Cập nhật trạng thái của group order
                getGroupOrder = await this.groupOrderOopSystemService.changeStatus(lang, getGroupOrder._id, STATUS_ORDER.done)
            }
            return payloadDependency;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async checkOverlapOrder(lang, idCollaborator, idGroupOrder) {
        try {
            const arrOrder = await this.orderOopSystemService.getListOrderByGroupOrderAndStatus(idGroupOrder)
            if(arrOrder.length > 0) {
                for(let i = 0; i < arrOrder.length; i++) {
                    await this.orderOopSystemService.checkOverlapOrder(lang, idCollaborator, arrOrder[i])
                }
            }
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async addPayPointsForInviter(lang, getCustomer, subjectAction) {
        try {
            const payloadDependency = {
                customer: null,
                collaborator: null
            }

            // Neu la don dau tien cua khach hang thi check nguoi gioi thieu cua khach hang co hay khong. Neu co thi tang voucher cho nguoi gioi thieu
            const getCount = await this.orderOopSystemService.countOrdersByCustomer(getCustomer._id, STATUS_ORDER.done)
            let isCustomer = true
            if (getCount === 1 && (getCustomer.id_inviter || getCustomer.id_customer_inviter || getCustomer.id_collaborator_inviter)) {
                let idCustomer = getCustomer.id_inviter || getCustomer.id_customer_inviter
                let getInviter = await this.customerOopSystemService.getDetailInviter(idCustomer)
                if(!getInviter) {
                    let idCollaborator = getCustomer.id_inviter || getCustomer.id_collaborator_inviter
                    getInviter = await this.collaboratorOopSystemService.getDetailInviter(idCollaborator)
                    isCustomer = false
                }
                if (getInviter) {
                    let previousBalancePayPoints = {
                        pay_point: getInviter?.pay_point || 0,
                        work_wallet: 0
                    }
                    // Cong tien thuong
                    if(isCustomer) {
                        payloadDependency.customer = await this.customerOopSystemService.addPayPoint(lang, REFERRAL_MONEY, getInviter._id)
                    } else {
                        previousBalancePayPoints.work_wallet = getInviter.work_wallet
                        payloadDependency.collaborator = await this.collaboratorOopSystemService.addPointWallet(lang, getInviter._id, TYPE_WALLET.work_wallet, REFERRAL_MONEY)
                    }
                    // Log tang tien thuong 
                    await this.historyActivityOopSystemService.addPayPointsForInviterWhenDoneOrder(subjectAction, payloadDependency, previousBalancePayPoints, REFERRAL_MONEY, getCustomer, isCustomer)
                    // Thong bao
                    await this.notificationSystemService.addPayPoint(lang, getCustomer, getInviter, REFERRAL_MONEY, isCustomer)
                }
            }

            return true
        }catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);

        }
    }

    async processingToPending(lang, payload, isAutoCapture?) {
        try {
            // Chu y: orderId la id_group_order
            const getGroupOrder = await this.groupOrderOopSystemService.getDetailItem(lang, payload.orderId)
            const [getOrder, getCustomer] = await Promise.all([this.orderOopSystemService.getFirstOrderByGroupOrder(getGroupOrder._id), this.customerOopSystemService.getDetailItem(lang, getGroupOrder.id_customer)])
            
            const payloadDependency = {
                order: getOrder,
                group_order: getGroupOrder,
                customer: getCustomer,
                transaction: null
            }

            const paymentMethod = getGroupOrder.payment_method

            const subjectAction = {
                _id: getCustomer._id,
                type: TYPE_USER_OBJECT.customer
            }

            if (getGroupOrder.status === STATUS_ORDER.processing) {
                // Chuyen trang thai order va group order
                await this.orderOopSystemService.changeStatusAllOrderByGroupOrder(getGroupOrder._id, STATUS_ORDER.pending)
                payloadDependency.group_order = await this.groupOrderOopSystemService.changeStatus(lang, getGroupOrder._id, STATUS_ORDER.pending)

                if (isAutoCapture || isAutoCapture === undefined || isAutoCapture === null) {
                    const getTransaction = await this.transactionOopSystemService.getDetailItemByIdGroupOrder(lang, getGroupOrder._id)
                    
                    if (getGroupOrder.payment_method === PAYMENT_METHOD.vnpay || getGroupOrder.payment_method === PAYMENT_METHOD.vnbank || getGroupOrder.payment_method === PAYMENT_METHOD.intcard) {
                        getTransaction.vnpay_transfer = { ...payload.query }
                    } else if (getGroupOrder.payment_method === PAYMENT_METHOD.momo) {
                        getTransaction.momo_transfer = payload
                    }
                    getTransaction.status = STATUS_TRANSACTION.done
                    getTransaction.date_verify = new Date().toISOString()
    
                    payloadDependency.transaction = await this.transactionOopSystemService.updateTransaction(lang, getTransaction)
                }
                await this.historyActivityOopSystemService.paymentServiceCustomer(subjectAction, payloadDependency, payloadDependency.group_order.final_fee, PAYMENT_METHOD[paymentMethod])
    
                await this.historyActivityOopSystemService.createGroupOrder(subjectAction, payloadDependency)
    
                // ban thong bao don moi
                await this.notificationSystemService.createGroupOrder(lang, subjectAction, payloadDependency, getCustomer, true)
            }

            if (getGroupOrder.status === STATUS_ORDER.cancel) {
                const getFinalFeeRemain = await this.orderOopSystemService.totalFinalFeeRemain(lang, getGroupOrder._id);
                const customer = await this.customerOopSystemService.addPayPoint(lang, getFinalFeeRemain, getCustomer._id)
                payloadDependency.customer = customer;
                await this.historyActivityOopSystemService.refundPayPointCustomer({type: "system", _id: null}, payloadDependency, getFinalFeeRemain)
                await this.notificationSystemService.refundCustomer(lang, payloadDependency, getFinalFeeRemain);
            }

            return true
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async processingToCancel(lang, payload) {
        try {
            // Chu y: orderId la id_group_order
            const getGroupOrder = await this.groupOrderOopSystemService.getDetailItem(lang, payload.orderId)
            const getOrder = await this.orderOopSystemService.getFirstOrderByGroupOrder(getGroupOrder._id)

            // Chuyen trang thai order va group order
            await this.groupOrderOopSystemService.changeStatus(lang, getGroupOrder._id, STATUS_ORDER.cancel)
            await this.orderOopSystemService.cancelAllOrderByGroupOrder(lang, getGroupOrder._id)

            const getTransaction = await this.transactionOopSystemService.getDetailItemByIdGroupOrder(lang, getOrder._id)
            getTransaction[`${getGroupOrder.payment_method}_transfer`] = payload
            getTransaction.status = STATUS_TRANSACTION.cancel
            await this.transactionOopSystemService.updateTransaction(lang, getTransaction)

            return true

        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async changeStatusOrder(lang, subjectAction, idOrder, payload, idCancel?) {
        try {
            const getOrder = await this.orderOopSystemService.getDetailItem(lang, idOrder);
            
            // Check trang thai don hang
            await this.checkStatusOrder(lang, getOrder, payload)

            await Promise.all([this.groupOrderOopSystemService.getDetailItem(lang, getOrder.id_group_order), this.customerOopSystemService.getDetailItem(lang, getOrder.id_customer)])
            let getCollaborator = null;
            if (getOrder.id_collaborator) {
                getCollaborator = await this.collaboratorOopSystemService.getDetailItem(lang, getOrder.id_collaborator)
            }

            if (payload.status === STATUS_ORDER.cancel && idCancel !== null && idCancel !== '') {
                await this.cancelOrder(lang, subjectAction, idOrder, idCancel)
            } else if (payload.status === 'next') {
                if (getOrder.status === STATUS_ORDER.confirm) {
                    await this.confirmToDoing(lang, idOrder, getCollaborator._id, subjectAction)
                } else if (getOrder.status === STATUS_ORDER.doing) {
                    const result = await this.doingToDone(lang, idOrder, getCollaborator._id, subjectAction);
                    // if (result.groupOrder.type === "loop" && result.groupOrder.is_auto_order === true) {
                        // await this.groupOrderSystemService.createLoopGroupOrder(lang, result.groupOrder);
                    // }
                }
            }
        
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);;
        }
    }



    async checkStatusOrder(lang, order, payload) {
        try {
            if (order.status === STATUS_ORDER.cancel) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_CANCELED, lang, null)], HttpStatus.BAD_REQUEST);
            } 
            if (order.status === STATUS_ORDER.done) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_DONE, lang, null)], HttpStatus.BAD_REQUEST);
            } 
            if (order.status === STATUS_ORDER.pending && payload.status !== STATUS_ORDER.cancel) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.DO_NOT_CHANGE_STATUS, lang, null)], HttpStatus.BAD_REQUEST);
            } 

            return true
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async testPushNoti(fcmToken) {
        try {
            console.log('dasd');
            
            // const getCustomer = await this.customerOopSystemService.getDetailItem("vi", idCustomer);
            // const getCustomer = await this.collaboratorOopSystemService.getDetailItem("vi", idCustomer);

            // const payloadDependency = {
            //     customer: getCustomer
            // }
            // const subjectAction = {
            //     type: TYPE_SUBJECT_ACTION.collaborator,
            //     _id: getCustomer._id
            // }
            const payload = {
                token: fcmToken,
                title: "title",
                body: "body",
                imageUrl: null,
                data: {
                    id_notification: "1925y18241212",
                    user_id: "1251i2y39124",
                    user_object: TYPE_SUBJECT_ACTION.collaborator,
                    id_device_token: fcmToken,
                },
                user_object: TYPE_SUBJECT_ACTION.collaborator,
                soundGuvi: 'duplicatesoundguvi',
                
            }

            const message = await this.pushNotificationService.configMessage(payload)

            console.log(message, 'mess');
            await this.pushNotificationService.sendEach([message])


            //  for(let i = 0 ; i < 5 ; i++) {
                // setTimeout(async () => {
                    // await this.notificationSystemService.testNoti("vi", subjectAction, payloadDependency, getCustomer, idChanel)
            //     }, (1000 * i));
            // }
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    async createGroupOrder(lang, subjectAction, request, stepByStep, payload: createGroupOrderDTO, user) {
        try {
            const getCustomer = await this.customerOopSystemService.getDetailItem(lang, payload.id_customer);
            let payloadDependency = {
                customer: getCustomer,
                group_order: null,
                collaborator: null,
                admin_action: null,
                order: null
            }
            if(subjectAction.type === TYPE_SUBJECT_ACTION.admin) {
                const getUser = await this.userSystemOoopSystemService.getDetailItem(lang, subjectAction._id)
                payloadDependency.admin_action = getUser
            }
            if(payload.id_collaborator) {
                const collaborator = await this.collaboratorOopSystemService.getDetailItem(lang, payload.id_collaborator);
                payloadDependency.collaborator = collaborator
            }
            // console.log(payload, 'payload');
            

            // if(payload.payment_method === "point" && subjectAction.type !== "admin") {
            //     throw new HttpException([await this.customExceptionService.i18nError(ERROR.PAYMENT_METHOD_MAIN_TAIN, lang, null)], HttpStatus.NOT_FOUND);
            // }

            // 0.1
            // if(payload.tip_collaborator !== 0 && payload.payment_method === 'cash') {
            //     throw new HttpException([await this.customExceptionService.i18nError(ERROR.PAYMENT_METHOD_CASH_NOT_SUPPORT_TIP, lang, "payment_method")], HttpStatus.BAD_REQUEST)
            // }

            // 0.2 xac dinh khu vuc dat ca
            const codePayloadArea = await this.identifyArea(payload);

            //// 1. tinh gia tien ban dau va kiem tra khuyen mai co hop le hay ko
            let infoJob = await this.calculateFeeGroupOrder(lang, payload, subjectAction)

            // 2. kiem tra ma khuyen mai co hop le voi don hang do hay khong
            // infoJob = await this.calculatePromotion(infoJob);

             // Kiem tra trung gio neu co id_collaborator
            if(payload.id_collaborator) {
                await this.orderSystemService.checkOverlapOrderWhenCreating(lang, payload.id_collaborator, infoJob.date_work_schedule, infoJob.total_estimate)
            }

            // 3. check phuong thuc thanh toan cua KH
            if(stepByStep.is_check_wallet_customer === true && payload.payment_method === "point") {
                await this.customerOopSystemService.checkBalancePayPoint(lang, payload.id_customer, infoJob.final_fee)
            }

            // 4. check xem CTV co du so tien de nhan don hay khong
            if(stepByStep.is_check_wallet_collaborator === true && payload.id_collaborator && infoJob.payment_method === PAYMENT_METHOD.cash) {
                // console.log(infoJob.platform_fee, "infoJob.platform_fee");
                
                // // add tam 2k phi dich vu
                // await this.collaboratorOopSystemService.checkBalanceWallet(lang, payload.id_collaborator, infoJob.date_work_schedule[0].platform_fee + 2000)

                // su dung thu phi final_fee neu nhu ca lam tien mat
                await this.collaboratorOopSystemService.checkBalanceWallet(lang, payload.id_collaborator, infoJob.date_work_schedule[0].work_shift_deposit)
            }
            
            // 5. tao group order
            const createGroupOrder = await this.groupOrderOopSystemService.createItem(lang, infoJob, payload, codePayloadArea, getCustomer, payloadDependency.collaborator)

            payloadDependency.group_order = createGroupOrder
            if (payload.payment_method === PAYMENT_METHOD.cash || payload.payment_method === PAYMENT_METHOD.point) {
                await this.historyActivityOopSystemService.createGroupOrder(subjectAction, payloadDependency)
            }
            // tạo đơn rồi thì update lại số lượng sử dụng KM
            await this.promotionOopSystemService.increaseTotalUsedPromotionCode(lang, payload.code_promotion)

            // Update lại số lượng mã khuyến mãi
            await this.promotionOopSystemService.increaseTotalUsedPromotionEvent(lang, infoJob.event_promotion)
            // 6. tao ra order rieng le
            const listOrder = await this.orderOopSystemService.createOrderByGroupOrder(lang, createGroupOrder, infoJob)

            // update ListOrder trong groupOrder va tra ve ca lam dau tien de tru phi collaborator
            payloadDependency.order = await this.groupOrderOopSystemService.updateListOrder(lang, createGroupOrder, listOrder)

            // 7. tru tien KH
            if (stepByStep.is_payment_service_customer === true && createGroupOrder.payment_method === PAYMENT_METHOD.point) {
                let customer = await this.customerOopSystemService.redeemPayPoint(lang, payload.id_customer, infoJob.final_fee)
                payloadDependency.customer = customer;
                await this.historyActivityOopSystemService.paymentPayPointCustomer(subjectAction, payloadDependency, infoJob.final_fee)
            }
            // Thanh toan bang Momo
            // Thanh toan lien ket vi

            // Thanh toan thong thuong
            // Thanh toan giu tien (isAutoCapture = false)
            let resultPayment:any
            // if (stepByStep.is_payment_service_customer === true && createGroupOrder.payment_method === PAYMENT_METHOD.momo && payloadDependency.group_order.type !== TYPE_GROUP_ORDER.schedule) {
            //     resultPayment = await this.paymentSystemService.useNormalMomoPayment(lang, payloadDependency, subjectAction, user, false)
            // }

            // Thanh toan tru tien luon (isAutoCapture = true)
            // Hoac thanh toan vnpay
            if (stepByStep.is_payment_service_customer === true && createGroupOrder.payment_method !== PAYMENT_METHOD.cash && createGroupOrder.payment_method !== PAYMENT_METHOD.point) {
                resultPayment = await this.paymentSystemService.payForOrderWithEWallet(lang, subjectAction, payloadDependency, user, createGroupOrder.payment_method, request, true)
            }


            // if(stepByStep.is_minus_collaborator === true && payload.id_collaborator && payloadDependency.order.payment_method === PAYMENT_METHOD.cash) {
            //     // const minusFee = payloadDependency.order.platform_fee + payloadDependency.order.pending_money;
            //     const minusFee = payloadDependency.order.final_fee;
                
            //     let collaborator = await this.collaboratorOopSystemService.getDetailItem(lang, payload.id_collaborator);
            //     const previousBalance = {
            //         work_wallet: collaborator.work_wallet,
            //         collaborator_wallet: collaborator.collaborator_wallet,
            //     }
            //     collaborator = await this.collaboratorOopSystemService.minusCollaborator(lang, payload.id_collaborator, minusFee)
            //     payloadDependency.collaborator = collaborator
            //     await this.historyActivityOopSystemService.minusPlatformFee(subjectAction, payloadDependency, minusFee, previousBalance)
            //     await this.notificationSystemService.minusPlatformFee(lang, createGroupOrder._id, payloadDependency.order, collaborator, minusFee)
            // }


            // console.log(payloadDependency.order, 'payloadDependency.order');
            

            // 8. thu phi CTV va gan don cho CTV neu co
            if(stepByStep.is_minus_collaborator === true) {
                await this.pendingToConfirm(lang, subjectAction, payloadDependency.order._id, payload.id_collaborator, payload.check_time)
            }
            
            if (resultPayment) {
                // Cap nhat deep link cho order va group order
                let deep_link:any 
                if(resultPayment?.deeplink) {
                    deep_link = resultPayment.deeplink
                } else {
                    deep_link = resultPayment
                }
                await this.orderOopSystemService.updateDeepLinkOrder(lang, payloadDependency.order._id, deep_link)
                await this.groupOrderOopSystemService.updateDeepLinkGroupOrder(lang, payloadDependency.group_order._id, deep_link)

                let type:any
                if(createGroupOrder.payment_method === PAYMENT_METHOD.momo) {
                    type = TYPE_RESPONSE_ORDER.deep_link
                }
                if(createGroupOrder.payment_method === PAYMENT_METHOD.vnpay || createGroupOrder.payment_method === PAYMENT_METHOD.vnbank || createGroupOrder.payment_method === PAYMENT_METHOD.intcard) {
                    type = TYPE_RESPONSE_ORDER.url
                }

                return { result:resultPayment, type }
            }
            
            // ban thong bao don moi
            await this.notificationSystemService.createGroupOrder(lang, subjectAction, payloadDependency, getCustomer, (payload.id_collaborator) ? false : true)
            
            return { type: TYPE_RESPONSE_ORDER.none };
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async identifyArea(payload) {
        try {
            let convertToken = {
                lat: 0,
                lng: 0,
                address: "",
                type_address_work: payload.type_address_work || "house",
                note_address: ""
            };
            if (payload.token) {
                const temp = await this.generalHandleService.decryptObject(payload.token);
                convertToken.lat = temp.lat
                convertToken.lng = temp.lng
                convertToken.address = temp.address
            }
            const getCodeAdministrative = await this.generalHandleService.getCodeAdministrativeToString(convertToken.address);
            return getCodeAdministrative;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async calculateFeeGroupOrder(lang, payload: createGroupOrderDTOCustomer, subjectAction) {
        try {
            const findCustomer = await this.customerOopSystemService.getDetailItem(lang, payload.id_customer);
            if (payload.extend_optional.length === 0) throw new HttpException([await this.customExceptionService.i18nError(ERROR.DATA_IS_VALID, lang, 'extend_optional')], HttpStatus.BAD_REQUEST);
            if (!payload.token) throw new HttpException([await this.customExceptionService.i18nError(ERROR.CANNOT_FIND_ADDRESS, lang, 'address')], HttpStatus.BAD_REQUEST);
            if (payload.date_work_schedule.length === 0) throw new HttpException([await this.customExceptionService.i18nError(ERROR.DATE_WORK_NOT_EMPTY, lang, 'date_work_schedule')], HttpStatus.BAD_REQUEST);
            if (payload.type === TYPE_GROUP_ORDER.schedule && payload.date_work_schedule.length < 4) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.DATE_WORK_NOT_ENOUGH, lang, 'date_work_schedule')], HttpStatus.BAD_REQUEST);
        }
            let convertToken = {
                lat: 0,
                lng: 0,
                address: "",
                type_address_work: payload.type_address_work || "house",
                note_address: ""
            };
            if (payload.token) {
                const temp = await this.generalHandleService.decryptObject(payload.token);
                convertToken.lat = temp.lat
                convertToken.lng = temp.lng
                convertToken.address = temp.address
            }
            const getCodeAdministrative = await this.identifyArea(payload);
            payload.date_work_schedule.sort((a, b) => new Date(a).getTime() > new Date(b).getTime() ? 1 : -1)

            // lay extend optional va kiem tra xem cac extend dua len co cung service hay ko
            const tempData = await this.processServiceFromPayload(lang, payload.extend_optional, getCodeAdministrative);


            // console.log(tempData, 'tempData');
            

            // Kiem tra gio dat don hang co lon hon hoac bang gio toi thieu cua service hay khong
            // Danh cho khach hang
            if (subjectAction.type === 'customer') {
                const period = (new Date(payload.date_work_schedule[0]).getTime() - new Date().getTime())/ (1000 * 60 * 60)
                if (period < tempData.service.minimum_time_order) {
                    const hours = new Date(payload.date_work_schedule[0]).getHours().toString().padStart(2, '0')
                    const minutes = new Date(payload.date_work_schedule[0]).getMinutes().toString().padStart(2, '0')

                    const time = `${hours}:${minutes}`
                    const property = {
                        property: time
                    }
                    throw new HttpException([await this.customExceptionService.i18nErrorWithProperty(ERROR.ORDER_TIME_OVERLAP, lang, property, 'order_time_overlap') ], HttpStatus.BAD_REQUEST);
                }
            }
            
            // const getTotalEstimate

            const service = tempData.service;
            const totalEstimate = tempData.getTotalEstimate

            let infoJob: any = {
                lat: convertToken.lat,
                lng: convertToken.lng,
                address: convertToken.address,
                type_address_work: convertToken.type_address_work,
                note_address: convertToken.note_address,
                service: JSON.parse(JSON.stringify(service)),
                type: service.type,
                city: getCodeAdministrative.city,
                district: getCodeAdministrative.district,
                tip_collaborator: payload.tip_collaborator || 0 * payload.date_work_schedule.length,
                payment_method: payload.payment_method,
                personal: 1, // ko ap dung cho tong ve sinh
                // personal: (mainOptionalService !== null) ? mainOptionalService.extend_optional[0].personal : 1,
                total_estimate: totalEstimate,
                initial_fee: 0,
                total_fee: 0,
                platform_fee: 0,
                final_fee: 0,
                net_income_collaborator: 0,
                date_work_schedule: [],
                code_promotion: null,
                event_promotion: [],
                total_discount: 0,
                promotion_value_fee: 0,
                subtotal_fee: 0,
                shift_income: 0,
                value_added_tax: 0,
                net_income: 0
            }

            // reset gia tien trong service chinh
            for (let y = 0; y < service.optional_service.length; y++) {
                for (let z = 0; z < service.optional_service[y].extend_optional.length; z++) {
                    service.optional_service[y].extend_optional[z].price = 0;
                }
            }

            for (let i = 0; i < payload.date_work_schedule.length; i++) {
                let payloadItemDateWork = {
                    initial_fee: 0,
                    platform_fee: 0,
                    discount: 0,
                    final_fee: 0,
                    subtotal_fee: 0,
                    shift_income: 0,
                    net_income: 0,
                    value_added_tax: 0,
                    service: null,
                    date: payload.date_work_schedule[i],
                    is_rush_time: false,
                    code_promoition: null,
                    event_promotion: []
                }
                let tempService = infoJob.service;
                const dayWork = new Date(payload.date_work_schedule[i]);
                let initialFee = 0;
                let serviceFee = 0;
                // let subtotalFee = 0;
                // let shiftIncome = 0;

                let PriceIncreaseRushDays = []; // hien thi chi tiet
                let priceIncreaseHoliday = null;
                for (let y = 0; y < tempService.optional_service.length; y++) {
                    for (let z = 0; z < tempService.optional_service[y].extend_optional.length; z++) {
                        let priceUp = 0;
                        // let platformFee = 0;
                        // let subtotalFee = 0;
                        // let shiftIncome = 0;
                        // let valueAddedTax = 0;
                        priceUp = tempService.optional_service[y].extend_optional[z].price * tempService.optional_service[y].extend_optional[z].count
                        
                        tempService.optional_service[y].extend_optional[z].initial_fee = tempService.optional_service[y].extend_optional[z].price;
                        
                        if (tempService.optional_service[y].extend_optional[z].area_fee !== null) {
                            if (tempService.optional_service[y].extend_optional[z].area_fee.area_lv_2 !== null) {
                                priceUp = tempService.optional_service[y].extend_optional[z].area_fee.area_lv_2.price * tempService.optional_service[y].extend_optional[z].count
                            } else {
                                priceUp = tempService.optional_service[y].extend_optional[z].area_fee.price * tempService.optional_service[y].extend_optional[z].count
                            }
                            

                            // tang gia ngay gio cao diem
                            for (const itemRushDay of tempService.optional_service[y].extend_optional[z].area_fee.price_option_rush_day) {
                                // const dayWork = new Date(payload.date_work_schedule[i]);
                                let dayCompare = Number(dayWork.getTime()) + (itemRushDay.time_zone_apply * 60 * 60 * 1000);
                                const dayOfWeek = new Date(dayCompare).getDay();
                                const getDay = payload.date_work_schedule[i].split("T")[0];
                                const timeStart = new Date(getDay + "T" + itemRushDay.start_time).getTime()
                                const endTime = new Date(getDay + "T" + itemRushDay.end_time).getTime()
                                if (itemRushDay.rush_days.findIndex(x => dayOfWeek === x) > -1 && timeStart < (dayCompare + 1) && (dayCompare - 1) < endTime) {
                                    let temp = 0;
                                    if (itemRushDay.price_type_increase === "percent_accumulate") {
                                        temp = priceUp * (itemRushDay.price / 100) || 0;
                                    }
                                    temp = (temp > 0) ? Math.ceil(temp / 1000) * 1000 : 0;
                                    priceUp += Math.ceil(temp);
                                    tempService.optional_service[y].extend_optional[z].fee_up_rush_day = Math.ceil(temp)
                                    PriceIncreaseRushDays.push(Object.assign(itemRushDay, { fee: temp }))

                                }
                            }

                            // Tang gia theo ngay le
                            for (const itemRushHoliday of tempService.optional_service[y].extend_optional[z].area_fee.price_option_holiday) {
                                const dateCompare = new Date(payload.date_work_schedule[i]).getTime();
                                const timeStart = new Date(itemRushHoliday.time_start).getTime();
                                const timeEnd = new Date(itemRushHoliday.time_end).getTime();
                                let temp = 0;
                                if (timeStart < dateCompare && dateCompare < timeEnd) {

                                    if (itemRushHoliday.price_type_increase === "percent_accumulate") {
                                        temp = priceUp * (itemRushHoliday.price / 100) || 0;
                                    }
                                    // if(temp > 0) {
                                    //     console.log(temp, 'temp');
                                    //     console.log(Math.ceil(temp / 1000), 'Math.ceil(temp / 1000)');
                                    //     console.log(Math.ceil(temp / 1000) * 1000, 'Math.ceil(temp / 1000) * 1000');
                                    // }
                                    temp = (temp > 0) ? Math.ceil(temp / 1000) * 1000 : 0;
                                    priceUp += Math.ceil(temp);
                                    tempService.optional_service[y].extend_optional[z].fee_up_holiday = Math.ceil(temp)
                                    priceIncreaseHoliday = Object.assign(itemRushHoliday, { fee: temp });
                                    break;
                                }
                            }
                        }

                        initialFee = priceUp;

                        if (PriceIncreaseRushDays.length > 0 || priceIncreaseHoliday !== null) payloadItemDateWork.is_rush_time = true;
                        
                        // let tempPlatformFee = 0;

                        // gia dich vu truoc thue
                        // subtotalFee = Number(((Math.round(initialFee/1000)) / (1 + Number(tempService.value_added_tax/100))).toFixed(1)) * 1000;

                        // valueAddedTax = initialFee - subtotalFee;

                        // tempPlatformFee = Math.ceil(Number(subtotalFee) * (Number(percentPlatformFee) / 100))
                        // tempPlatformFee = Math.round(tempPlatformFee / 100)
                        // platformFee = tempPlatformFee * 100;
                        // shiftIncome = subtotalFee - platformFee

                        // if(initialFee) {
                        //     const tempVAT = (Math.round((initialFee/1000) * ( tempService.value_added_tax / 100 ))) * 1000; // VAT dich vu
                        //     subtotalFee = initialFee - tempVAT;
                        //     tempPlatformFee = Math.ceil(Number(subtotalFee) * (Number(percentPlatformFee) / 100))
                        //     tempPlatformFee = Math.round(tempPlatformFee / 100)
                        //     platformFee = tempPlatformFee * 100;
                        //     shiftIncome = subtotalFee - platformFee
                        // }
                        

                        // console.log('-----------');
                        // console.log(tempVAT, 'tempVAT');
                        // console.log(priceUp, 'priceUp');
                        // console.log(platformFee, 'platformFee');
                        // console.log(initialFee, 'initialFee');
                        // console.log(subtotalFee, 'subtotalFee');
                        // console.log(shiftIncome, 'shiftIncome');

                        // set gia chi tiet cho tung dich vu 
                        tempService.optional_service[y].extend_optional[z].initial_fee = initialFee;
                        // tempService.optional_service[y].extend_optional[z].platform_fee = platformFee;
                        // tempService.optional_service[y].extend_optional[z].subtotal_fee = subtotalFee;
                        // tempService.optional_service[y].extend_optional[z].shift_income = shiftIncome;
                        // tempService.optional_service[y].extend_optional[z].value_added_tax = valueAddedTax;

                        // console.log(platformFee, 'platformFee');

                        // set gia tong cho ngay hom do
                        payloadItemDateWork.initial_fee += initialFee;
                        // payloadItemDateWork.platform_fee += platformFee;
                        // payloadItemDateWork.subtotal_fee += subtotalFee;
                        // payloadItemDateWork.shift_income += shiftIncome;
                        // payloadItemDateWork.value_added_tax += valueAddedTax;


                        payloadItemDateWork.service = tempService


                        tempService.optional_service[y].extend_optional[z].price = initialFee
                        // console.log(service.optional_service[y].extend_optional[z].price, 'service.optional_service[y].extend_optional[z].price');
                        
                        service.optional_service[y].extend_optional[z].price += initialFee
                        // console.log(service.optional_service[y].extend_optional[z].price, 'service.optional_service[y].extend_optional[z].price');

                    }
                }

                
                payloadItemDateWork.net_income = payloadItemDateWork.shift_income + (payload.tip_collaborator || 0) // thu nhap rong = thu nhap ca lam + tien tip

                infoJob.initial_fee += payloadItemDateWork.initial_fee;
                // infoJob.platform_fee += payloadItemDateWork.platform_fee;
                // infoJob.subtotal_fee += payloadItemDateWork.subtotal_fee;
                // infoJob.shift_income += payloadItemDateWork.shift_income;
                // infoJob.net_income += payloadItemDateWork.net_income;
                // infoJob.value_added_tax += payloadItemDateWork.value_added_tax;

                // infoJob. += payloadItemDateWork.net
                
                infoJob.date_work_schedule.push(payloadItemDateWork)
            }

            infoJob.service = {...service};


            let calculateCodePromotion = null;
            if (payload.code_promotion !== null && payload.code_promotion !== undefined &&
                payload.code_promotion !== "") {
                calculateCodePromotion = await this.promotionOopSystemService.calculateCodePromotion(lang, infoJob, payload.code_promotion, findCustomer);
            }
            const calculateEventPromotion = await this.promotionOopSystemService.calculateEventPromotion(lang, infoJob, findCustomer);
            
            
            let loadcalculateFinalFee = {
                initial_fee: infoJob.initial_fee,
                code_promotion: calculateCodePromotion,
                event_promotion: calculateEventPromotion.event_promotion || [],
                service_fee: await this.serviceFeeOopSystemService.getServiceFeeByinfoJob(lang, infoJob),
                type: infoJob.type,
                total_tip_collaborator: payload.tip_collaborator * infoJob.date_work_schedule.length || 0,
                total_discount: 0,
                final_fee: 0,
                total_fee: 0,
            }
            
            loadcalculateFinalFee = await this.calculateFinalFee(loadcalculateFinalFee)

            
            infoJob.service_fee = loadcalculateFinalFee.service_fee
            infoJob.final_fee = (loadcalculateFinalFee.final_fee < 0) ? 0 : loadcalculateFinalFee.final_fee
            infoJob.total_fee = loadcalculateFinalFee.total_fee
            infoJob.total_discount = loadcalculateFinalFee.total_discount
            
            infoJob.code_promotion = calculateCodePromotion || null
            
            infoJob.event_promotion = calculateEventPromotion.event_promotion || []
            
            if(infoJob.date_work_schedule.length > 1) {
                infoJob = await this.calculateDiscountPerDate(infoJob)
            } else {
                infoJob.date_work_schedule[0].code_promotion = infoJob.code_promotion
                infoJob.date_work_schedule[0].event_promotion = infoJob.event_promotion
                infoJob.date_work_schedule[0].discount = infoJob.total_discount
                // console.log(infoJob.date_work_schedule[0], 'date_work_schedule[0]');
                
            }
            // infoJob.value_added_tax = (infoJob.final_fee - (infoJob.final_fee/(1 + infoJob.service.value_added_tax))).toFixed(1)
            // infoJob.subtotal_fee = infoJob.initial_fee - infoJob.value_added_tax
            // infoJob.shift_income = infoJob.subtotal_fee * 

            for (let i = 0; i < payload.date_work_schedule.length; i++) {
                let percentPlatformFee = 20;
                const areaFee = tempData.service.area_fee.find((e) => e.area_lv_1 === getCodeAdministrative.city)
                if(areaFee) {
                    percentPlatformFee = areaFee.platform_fee
                }
                
                let platformFee = 0;
                let subtotalFee = 0;
                let shiftIncome = 0;
                let valueAddedTax = 0;
                let tempPlatformFee = 0;

                let finalFee = infoJob.date_work_schedule[i].initial_fee + (i === 0 ? infoJob.service_fee[0].fee : 0) + (infoJob.tip_collaborator || 0);
                if (infoJob.date_work_schedule[i].code_promotion !== null && infoJob.date_work_schedule[i].code_promotion !== undefined) {
                    finalFee -= infoJob.date_work_schedule[i].code_promotion.discount
                }
                if (infoJob.date_work_schedule[i].event_promotion !== null && infoJob.date_work_schedule[i].event_promotion.length > 0 && infoJob.date_work_schedule[i].event_promotion !== undefined) {
                    for (const item of infoJob.date_work_schedule[i].event_promotion) {
                        finalFee -= item.discount
                    }
                }

                valueAddedTax =  (Math.round(finalFee/100 - ((finalFee/100)/(1 + (infoJob.service.value_added_tax/100))))) * 100  // VAT dich vu
                subtotalFee = infoJob.date_work_schedule[i].initial_fee - valueAddedTax

                tempPlatformFee = Number(subtotalFee) * (Number(percentPlatformFee) / 100)
                tempPlatformFee = Math.round(tempPlatformFee / 100)
                platformFee = tempPlatformFee * 100;
                shiftIncome = subtotalFee - platformFee

                // set gia tong cho ngay hom do
                infoJob.date_work_schedule[i].final_fee += finalFee
                infoJob.date_work_schedule[i].platform_fee += platformFee;
                infoJob.date_work_schedule[i].subtotal_fee += subtotalFee;
                infoJob.date_work_schedule[i].shift_income += shiftIncome;
                infoJob.date_work_schedule[i].value_added_tax += valueAddedTax;

                infoJob.date_work_schedule[i].net_income = infoJob.date_work_schedule[i].shift_income + (payload.tip_collaborator || 0) // thu nhap rong = thu nhap ca lam + tien tip
                infoJob.date_work_schedule[i]["work_shift_deposit"] = infoJob.date_work_schedule[i].platform_fee
                infoJob.date_work_schedule[i]["remaining_shift_deposit"] =infoJob.date_work_schedule[i].final_fee - infoJob.date_work_schedule[i].platform_fee

                infoJob.platform_fee += infoJob.date_work_schedule[i].platform_fee;
                infoJob.subtotal_fee += infoJob.date_work_schedule[i].subtotal_fee;
                infoJob.shift_income += infoJob.date_work_schedule[i].shift_income;
                infoJob.net_income += infoJob.date_work_schedule[i].net_income;
                infoJob.value_added_tax += infoJob.date_work_schedule[i].value_added_tax;
            }

            return infoJob;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // lay extend optional va kiem tra xem cac extend dua len co cung service hay ko
    async processServiceFromPayload(lang, arrExtend, getCodeAdministrative) {
        // async checkExtendOptionalPayloadIsAvaiable(lang, arrExtend) {
        try {

            let listExtendOptional = []; // mảng chứa extendOptional
            let listOptionalService = []; // mảng chứa Optional service

            const tempArrIdExtend = []
            for (let i = 0; i < arrExtend.length; i++) {
                tempArrIdExtend.push(arrExtend[i]._id)
            }

            listExtendOptional = await this.extendOptionalOopSystemService.getListWithArrId(tempArrIdExtend)

            let tempArrIdOptionalService = []
            for (let i = 0; i < listExtendOptional.length; i++) {
                tempArrIdOptionalService.push(listExtendOptional[i].id_optional_service)
            }
            // // xu ly optionalTrung
            tempArrIdOptionalService = await this.generalHandleService.removeDuplicateValueArr(tempArrIdOptionalService);

            listOptionalService = await this.optionalServiceOopSystemService.getListWithArrId(tempArrIdOptionalService);
            const checkInvalidOptional = listOptionalService.filter(item => item.id_service !== listOptionalService[0].id_service);
            if (checkInvalidOptional.length > 0) throw new HttpException([await this.customExceptionService.i18nError(ERROR.DATA_IS_VALID, lang, 'extend_optional')], HttpStatus.BAD_REQUEST);




            for (let i = 0; i < listExtendOptional.length; i++) {
                const temp = listOptionalService.findIndex(item => item._id.toString() === listExtendOptional[i].id_optional_service)
                const findCountExtend = arrExtend.findIndex(item => item._id === listExtendOptional[i]._id.toString())

                // xac dinh khu vuc ap dung tinh gia cho don hang
                let areaFee = null
                for (const itemCity of listExtendOptional[i].area_fee) {
                    if (itemCity.area_lv_1 === getCodeAdministrative.city) {
                        areaFee = itemCity
                        break;
                    }
                }
                if (areaFee !== null) {
                    let temp = null
                    for (const itemDistrict of areaFee.area_lv_2) {
                        if (itemDistrict.area_lv_2.findIndex(item => item === getCodeAdministrative.district) > -1) {
                            temp = itemDistrict
                        }
                    }
                    areaFee.area_lv_2 = temp
                }

                // if(areaFee !== null) {
                //     if(areaFee.area_lv_2 !== null) {
                //         console.log(areaFee.area_lv_2, 'areaFee');

                //     }
                // }

                

                listExtendOptional[i]['optional_service'] = listOptionalService[temp]
                // console.log(listExtendOptional[i].platform_fee, 'listExtendOptional[i].platform_fee');
                if (listOptionalService[temp]['extend_optional'] && listOptionalService[temp]['extend_optional'].length > 0) {                    
                    listOptionalService[temp]['extend_optional'].push({
                        _id: listExtendOptional[i]._id,
                        title: listExtendOptional[i].title,
                        description: listExtendOptional[i].description,
                        price: listExtendOptional[i].price,
                        count: (listOptionalService[temp].type.toString().search(/count/i) > -1) ? arrExtend[findCountExtend].count : 1,
                        estimate: listExtendOptional[i].estimate,
                        area_fee: areaFee || null,
                        personal: listExtendOptional[i].personal,
                        note: listExtendOptional[i].note,
                        percent_platform_fee: listExtendOptional[i].platform_fee,
                        thumbnail: listExtendOptional[i].thumbnail,
                        is_hide_collaborator: listExtendOptional[i].is_hide_collaborator,
                        initial_fee: 0,
                        platform_fee: 0,
                        fee_up_holiday: 0,
                        fee_up_rush_day: 0
                    })
                }
                else {
                    listOptionalService[temp]['extend_optional'] = [{
                        _id: listExtendOptional[i]._id,
                        title: listExtendOptional[i].title,
                        description: listExtendOptional[i].description,
                        price: listExtendOptional[i].price,
                        count: (listOptionalService[temp].type.toString().search(/count/i) > -1) ? arrExtend[findCountExtend].count : 1,
                        estimate: listExtendOptional[i].estimate,
                        area_fee: areaFee || null,
                        personal: listExtendOptional[i].personal,
                        note: listExtendOptional[i].note,
                        percent_platform_fee: listExtendOptional[i].platform_fee,
                        thumbnail: listExtendOptional[i].thumbnail,
                        is_hide_collaborator: listExtendOptional[i].is_hide_collaborator,
                        initial_fee: 0,
                        platform_fee: 0,
                        fee_up_holiday: 0,
                        fee_up_rush_day: 0
                    }]
                }
            }

            const optionalServiceInService = []
            for (const item of listOptionalService) {
                optionalServiceInService.push({
                    _id: item._id,
                    id_service: item.id_service,
                    extend_optional: item.extend_optional
                })
            }


            const service = await this.createObjectService(lang, optionalServiceInService);

            // console.log(listExtendOptional, 'listExtendOptional');
            

            const getTotalEstimate = await this.getTotalEstimate(service.type, listExtendOptional)

            const payloadResult = {
                service,
                getTotalEstimate
            }

            return payloadResult;

        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);

        }
    }


    // tao bo service de dua vao 
    async createObjectService(lang, listOptionalService) {
        try {
            const getServivce = await this.serviceOopSystemService.getDetailItem(lang, listOptionalService[0].id_service);
            const service = {
                _id: getServivce._id,
                type: getServivce.type,
                minimum_time_order: getServivce.minimum_time_order,
                optional_service: listOptionalService,
                value_added_tax: getServivce.value_added_tax,
                area_fee: getServivce.area_fee
            }
            return service;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getMainOptionalOrder(listExtendOptional) {
        try {
            listExtendOptional = listExtendOptional.sort((a, b) => a.estimate < b.estimate ? 1 : (a.estimate > b.estimate ? -1 : 0));
            return listExtendOptional[0];
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getTotalEstimate(serviceType, listExtendOptional) {
        try {
            
            let resultEstimate = 0;
            if(serviceType === "schedule" || serviceType === "loop") {
                const temp = await this.generalHandleService.sortArrObject(listExtendOptional, "estimate", -1);
                resultEstimate = temp[0].estimate
            }

            return resultEstimate
        } catch (err ) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async calculateDiscountPerDate(infoJob) {
        try {
            const totalDate = infoJob.date_work_schedule.length;

            if(infoJob.code_promotion !== null) {
                let temp = (infoJob.code_promotion.discount / 1000).toString().split(".");
                const soNguyen = Number(temp[0]);
                let soDuLeCuoi = 0;
                if(temp.length > 1) soDuLeCuoi = Number(temp[1]) * 100;
    
                let tempSoDu = soNguyen;
                let soDuDiemCuoi = 0
                while ((tempSoDu % totalDate) !== 0) {
                    tempSoDu -= 1;
                    soDuDiemCuoi++ 
                }
                const tempDiscountPerDate = tempSoDu / totalDate;
                for(let i = 0 ; i < totalDate - 1 ; i++) {
                    infoJob.date_work_schedule[i].code_promotion = {...infoJob.code_promotion};
                    infoJob.date_work_schedule[i].code_promotion.discount = tempDiscountPerDate * 1000
                }
                infoJob.date_work_schedule[totalDate - 1].code_promotion = {...infoJob.code_promotion};
                infoJob.date_work_schedule[totalDate - 1].code_promotion.discount = ((tempDiscountPerDate + soDuDiemCuoi) * 1000) + soDuLeCuoi
            }
            
            if(infoJob.event_promotion.length > 0) {
                for(let y = 0 ; y < infoJob.event_promotion.length ; y++) {
                    let temp = (infoJob.event_promotion[y].discount / 1000).toString().split(".");
                    const soNguyen = Number(temp[0]);
                    let soDuLeCuoi = 0;
                    if(temp.length > 1) soDuLeCuoi = Number(temp[1]) * 100;
        
                    let tempSoDu = soNguyen;
                    let soDuDiemCuoi = 0
                    while ((tempSoDu % totalDate) !== 0) {
                        tempSoDu -= 1;
                        soDuDiemCuoi++ 
                    }
                    const tempDiscountPerDate = tempSoDu / totalDate;
                    for(let i = 0 ; i < totalDate - 1 ; i++) {
                        infoJob.date_work_schedule[i].event_promotion.push({...infoJob.event_promotion[y]})
                        infoJob.date_work_schedule[i].event_promotion[infoJob.date_work_schedule[i].event_promotion.length - 1].discount = tempDiscountPerDate * 1000
                    }
                    const lengthEvent = infoJob.date_work_schedule[0].event_promotion.length;
                    
                    infoJob.date_work_schedule[totalDate - 1].event_promotion.push({...infoJob.event_promotion[y]})
                    infoJob.date_work_schedule[totalDate - 1].event_promotion[lengthEvent - 1].discount = ((tempDiscountPerDate + soDuDiemCuoi) * 1000) + soDuLeCuoi
                }
            }

            for(let i = 0 ; i < totalDate ; i++) {
                if(infoJob.code_promotion) {
                    infoJob.date_work_schedule[i].discount += infoJob.date_work_schedule[i].code_promotion.discount;
                }
                if(infoJob.event_promotion.length > 0 ) {
                    for(const item of infoJob.date_work_schedule[i].event_promotion) {
                        
                        infoJob.date_work_schedule[i].discount += item.discount
                    }
                }
            }
            

            return infoJob;
        } catch (err ) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async calculateFinalFee(loadcalculateFinalFee) {
        try {
            loadcalculateFinalFee.total_fee = loadcalculateFinalFee.initial_fee + loadcalculateFinalFee.total_tip_collaborator;
            loadcalculateFinalFee.final_fee = loadcalculateFinalFee.initial_fee + loadcalculateFinalFee.total_tip_collaborator;
    
            if (loadcalculateFinalFee.code_promotion !== null) {
                loadcalculateFinalFee.final_fee = loadcalculateFinalFee.final_fee - Number(loadcalculateFinalFee.code_promotion['discount'] | 0);
                loadcalculateFinalFee.total_discount += Number(loadcalculateFinalFee.code_promotion['discount'] | 0)
            }
            for (let i = 0; i < loadcalculateFinalFee.event_promotion.length; i++) {
                loadcalculateFinalFee.final_fee = loadcalculateFinalFee.final_fee - Number(loadcalculateFinalFee.event_promotion[i]['discount'] | 0);
                loadcalculateFinalFee.total_discount += Number(loadcalculateFinalFee.event_promotion[i]['discount'] | 0);
            }
            for (let i = 0; i < loadcalculateFinalFee.service_fee.length; i++) {
                loadcalculateFinalFee.final_fee = loadcalculateFinalFee.final_fee + Number(loadcalculateFinalFee.service_fee[i]['fee'] || 0);
                loadcalculateFinalFee.total_fee = loadcalculateFinalFee.total_fee + Number(loadcalculateFinalFee.service_fee[i]['fee'] || 0);
            }
            return loadcalculateFinalFee;
        } catch (err ) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }


    // moi thuat toan tru phi dich vu, thu ho tu doi tac se viet o day
    async minusFeeOrderByCollaborator(lang, subjectAction, payloadDependency) {
        try {
            const getOrder = payloadDependency.order
            const getGroupOrder = payloadDependency.group_order
            let getCollaborator = payloadDependency.collaborator
            // neu don hang thanh toan tien mat va la don moi thi khong can chay hoan tien
            if(getOrder.subtotal_fee !== getOrder.initial_fee && getOrder.payment_method !== PAYMENT_METHOD.cash) return payloadDependency;

            const chargeFee = (getOrder.subtotal_fee !== getOrder.initial_fee) ? getOrder.work_shift_deposit : getOrder.platform_fee + getOrder.pending_money;
            const previousBalance: previousBalanceCollaboratorDTO = {
                work_wallet: getCollaborator.work_wallet,
                collaborator_wallet: getCollaborator.collaborator_wallet
            }
            getCollaborator = await this.collaboratorOopSystemService.minusCollaborator(lang, getCollaborator._id, chargeFee, getGroupOrder.type, TYPE_ACTION.confirm_job)
            payloadDependency.collaborator = getCollaborator;
            // Log he thong va ban thong bao tru tien
            if(getOrder.remaining_shift_deposit === 0) {
                await this.historyActivityOopSystemService.minusPlatformFee(subjectAction, payloadDependency, chargeFee, previousBalance)
            } else {
                await this.historyActivityOopSystemService.minusNewPlatformFee(subjectAction, payloadDependency, chargeFee, previousBalance)
            }
            // await this.notificationSystemService.minusPlatformFee(lang, getGroupOrder._id, getOrder, getCollaborator, chargeFee)

            return payloadDependency;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async refundFeeOrderByCollaborator(lang, subjectAction, payloadDependency) {
        try {
            let getCollaborator = payloadDependency.collaborator;
            const getOrder = payloadDependency.order;
            const getGroupOrder = payloadDependency.group_order;
            const previousBalance = {
                work_wallet: getCollaborator.work_wallet,
                collaborator_wallet: getCollaborator.collaborator_wallet,
            }
            // neu don hang thanh toan tien mat va la don moi thi khong can chay hoan tien
            if(getOrder.subtotal_fee !== getOrder.initial_fee && getOrder.payment_method !== PAYMENT_METHOD.cash) return payloadDependency;

            const refundMoney = (getOrder.subtotal_fee === getOrder.initial_fee) ? getOrder.platform_fee + getOrder.pending_money : getOrder.final_fee;

            getCollaborator = await this.collaboratorOopSystemService.addPointWallet(lang, getGroupOrder.id_collaborator, "work_wallet", refundMoney);
            payloadDependency.collaborator = getCollaborator

            await this.historyActivityOopSystemService.refundPointWalletCollaborator({ type: "system", _id: null }, payloadDependency, previousBalance, refundMoney);
            await this.notificationSystemService.refundCollaborator(lang, payloadDependency, refundMoney);

            return payloadDependency;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async assignCollaborator(lang, subjectAction, payloadDependency) {
        try {
            const getOrder = payloadDependency.order
            const getCollaborator = payloadDependency.collaborator
            let getGroupOrder = payloadDependency.group_order
            const getCustomer = payloadDependency.customer

            await this.orderOopSystemService.assignCollaboratorByGroupOrder(getGroupOrder._id, getCollaborator)
            getGroupOrder = await this.groupOrderOopSystemService.assignCollaborator(lang, getGroupOrder._id, getCollaborator)

            // log he thong va ban thong bao xac nhan don
            await Promise.all([
                this.historyActivityOopSystemService.confirmOrder(subjectAction, payloadDependency),
                // this.notificationSystemService.confirmOrder(lang, getGroupOrder._id, getOrder, getCustomer, getCollaborator)
            ])
            // // await tung buoc o ngoai nay de debug loi
            // await this.historyActivityOopSystemService.confirmOrder(subjectAction, payloadDependency)
            // await this.notificationSystemService.confirmOrder(lang, getGroupOrder._id, getOrder, getCustomer, getCollaborator)

            payloadDependency.group_order = getGroupOrder;
            return payloadDependency;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async unAssignCollaborator(lang, subjectAction, payloadDependency) {
        try {
            const getOrder = payloadDependency.order
            const getCollaborator = payloadDependency.collaborator
            let getGroupOrder = payloadDependency.group_order
            const getCustomer = payloadDependency.customer

            await this.orderOopSystemService.assignCollaboratorByGroupOrder(getGroupOrder._id, getCollaborator)
            getGroupOrder = await this.groupOrderOopSystemService.assignCollaborator(lang, getGroupOrder._id, getCollaborator)

            // log he thong va ban thong bao xac nhan don
            await Promise.all([
                this.historyActivityOopSystemService.confirmOrder(subjectAction, payloadDependency),
                // this.notificationSystemService.confirmOrder(lang, getGroupOrder._id, getOrder, getCustomer, getCollaborator)
            ])
            // // await tung buoc o ngoai nay de debug loi
            // await this.historyActivityOopSystemService.confirmOrder(subjectAction, payloadDependency)
            // await this.notificationSystemService.confirmOrder(lang, getGroupOrder._id, getOrder, getCustomer, getCollaborator)

            payloadDependency.group_order = getGroupOrder;
            return payloadDependency;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }



    async addCollaboratorByOrder(lang, subjectAction, idOrder, req) {
        try {
            const payloadDependency: payloadDependencyDTO = {
                order: null,
                group_order: null,
                collaborator: null,
                admin_action: null
            }
            const getCollaborator = await this.collaboratorOopSystemService.getDetailItem(lang, req.id_collaborator);
            const getOrder = await this.orderOopSystemService.getDetailItem(lang, idOrder);
            const getGroupOrder = await this.groupOrderOopSystemService.getDetailItem(lang, getOrder.id_group_order)

            if(getOrder.id_collaborator !== null && getOrder.id_collaborator !== undefined) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_IS_CONFIRMED, lang, null)], HttpStatus.BAD_REQUEST);
            }

            if(subjectAction.type === TYPE_SUBJECT_ACTION.admin) {
                payloadDependency.admin_action = await this.userSystemOoopSystemService.getDetailItem(lang, subjectAction._id)
            }

            payloadDependency.order = getOrder
            payloadDependency.group_order = getGroupOrder
            payloadDependency.collaborator = getCollaborator


            // check don hang da doi trang thai chua

            // check trung gio
            if(req.check_time) {
                await this.checkOverlapOrder(lang, req.id_collaborator, getGroupOrder._id)
            } else {
                // Ghi log QTV cho phep trung don
                await this.historyActivityOopSystemService.allowConfirmingDuplicateOrder(subjectAction, payloadDependency)
            }

            // thu phi doi tac
            await this.minusFeeOrderByCollaborator(lang, subjectAction, payloadDependency)

            // assign doi tac vao don hang, ca lam do
            await this.assignCollaborator(lang, subjectAction, payloadDependency)


            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    // async changeStatusOrder(lang, subjectAction, idOrder, status) {
    //     try {


    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }

    async addAPointForReferrerPerson(lang, subjectAction, payloadDependency, getCustomerSetting, doneOrders) {
        try {
            const getCustomer = payloadDependency.customer
            const getReferrer = await this.customerOopSystemService.getDetailInviter(getCustomer.id_customer_referrer)

            if (getReferrer) {
                // Chua co don nao hoan thanh
                if(doneOrders < 1) {
                    // Kiem tra nguoi gioi thieu co nhan chiet khau khong
                    // Neu co thi cong vao a pay
                    if(!payloadDependency.customer.get_voucher) {
                        await this.addAPointAndLogForReferrer(lang, subjectAction, payloadDependency, getReferrer, getCustomerSetting)

                    }
                } else {
                    await this.addAPointAndLogForReferrer(lang, subjectAction, payloadDependency, getReferrer, getCustomerSetting)
                }
            }
            return true
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async addAPointAndLogForReferrer(lang, subjectAction, payloadDependency, getInviterAffiliate, getCustomerSetting) {
        try {
            const getOrder = payloadDependency.order
            const getCustomer = payloadDependency.customer
            const payloadDependencyAffiliate = {
                order: getOrder,
                customer: payloadDependency.customer,
                customer_referrer: null
            }

            const previousBalance = {
                a_pay: getInviterAffiliate.a_pay
            }

            const result = await this.customerOopSystemService.addAPay(lang, getInviterAffiliate._id, getOrder.final_fee, getCustomerSetting) 
            payloadDependencyAffiliate.customer_referrer = result.customer

            await this.historyActivityOopSystemService.addAPointForReferrerPerson(subjectAction, payloadDependencyAffiliate, previousBalance, getCustomer, result.money)

            return true
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async addPayPointsForInviterNew(lang, getCustomer, subjectAction) {
        try {
            const payloadDependency = {
                customer: null,
                collaborator: null
            }

            // Neu la don dau tien cua khach hang thi check nguoi gioi thieu cua khach hang co hay khong
            // Neu co thi tang voucher cho nguoi gioi thieu
            const getCount = await this.orderOopSystemService.countOrdersByCustomer(getCustomer._id, STATUS_ORDER.done)
            let isCustomer = true
            let getInviter:any
            if (getCount === 1) {
                if (getCustomer.id_customer_inviter || getCustomer.id_customer_referrer) {
                    const idCustomer = getCustomer?.id_customer_inviter || getCustomer?.id_customer_referrer
                    getInviter = await this.customerOopSystemService.getDetailInviter(idCustomer)

                    if (getCustomer.id_collaborator_inviter) {
                        isCustomer = false
                        getInviter = await this.collaboratorOopSystemService.getDetailInviter(getCustomer.id_collaborator_inviter)
                    }

                    if (getInviter) {
                        const previousBalancePayPoints = {
                            pay_point: getInviter?.pay_point || 0,
                            work_wallet: getInviter?.work_wallet || 0
                        }
                        // Cong tien thuong
                        if (isCustomer) {
                            payloadDependency.customer = await this.customerOopSystemService.addPayPoint(lang, REFERRAL_MONEY, getInviter._id)
                        } else {
                            payloadDependency.collaborator = await this.collaboratorOopSystemService.addPointWallet(lang, getInviter._id, TYPE_WALLET.work_wallet, REFERRAL_MONEY)
                        }
                        // Log tang tien thuong 
                        await this.historyActivityOopSystemService.addPayPointsForInviterWhenDoneOrder(subjectAction, payloadDependency, previousBalancePayPoints, REFERRAL_MONEY, getCustomer, isCustomer)
                        // Thong bao
                        await this.notificationSystemService.addPayPoint(lang, getCustomer, getInviter, REFERRAL_MONEY, isCustomer)
                    }
                }
            } 

            return true
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);

        }
    }

    async cancelGroupOrder(lang, orderId) {
        try {
            const subjectAction ={
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
            const idCancel = '6721e4312d7b05edb4f58734'
            await this.groupOrderSystemService2.cancelGroupOrder(lang, subjectAction, orderId, idCancel, stepCancel, true)
            
            return true
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async changeCollaborator(lang, subjectAction, idOrder, idCollaborator) {
        try {
            let payloadDependency = {
                order: null,
                group_order: null,
                collaborator: null,
                customer: null,
                admin_action: null
            }

            // 1. Lay thong tin
            if (subjectAction.type === TYPE_SUBJECT_ACTION.admin) {
                payloadDependency.admin_action = await this.userSystemOoopSystemService.getDetailItem(lang, subjectAction._id)
            }

            let [getOrder, getCollaborator] = await Promise.all([
                this.orderOopSystemService.getDetailItem(lang, idOrder),
                this.collaboratorOopSystemService.getDetailItem(lang, idCollaborator)
            ]) 
            const [getCustomer, getOldCollaborator, getGroupOrder] = await Promise.all([
                this.customerOopSystemService.getDetailItem(lang, getOrder.id_customer),
                this.collaboratorOopSystemService.getDetailItem(lang, getOrder.id_collaborator),
                this.groupOrderOopSystemService.getDetailItem(lang, getOrder.id_group_order)
            ])

            if (getGroupOrder.status === STATUS_ORDER.done || getGroupOrder.status === STATUS_ORDER.cancel || getGroupOrder.status === STATUS_ORDER.doing) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_SUPPORT_SERVICE, lang, 'service')], HttpStatus.BAD_REQUEST);
            }
            
            payloadDependency.customer = getCustomer
            payloadDependency.order = getOrder
            payloadDependency.group_order = getGroupOrder
            payloadDependency.collaborator = getCollaborator

            // Lay danh sach don hang theo id nhom hang va trang thai la confirm
            const getListOrder = await this.orderOopSystemService.getListOrderByGroupOrderAndStatus(getGroupOrder._id, STATUS_ORDER.confirm)

            // 2. Gan doi tac vao group order
            getGroupOrder.id_collaborator = getCollaborator._id;
            getGroupOrder.name_collaborator = getCollaborator.full_name;
            getGroupOrder.phone_collaborator = getCollaborator.phone;

            const newInfoLinked = {
                id_collaborator: getCollaborator._id,
                status: STATUS_ORDER.confirm
            }

            // 3. Thu phi cua CTV
            payloadDependency = await this.minusFeeOrderByCollaborator(lang, subjectAction, payloadDependency);
            getCollaborator = payloadDependency.collaborator
            // 4. Thay doi trang thai cua doi tac truoc trong info_linked_collaborator
            // Va them moi doi tac hien tai vao info_linked_collaborator
            const lstTask:any = []
            for (let i = 0; i < getListOrder.length; i++) {
                // Tim trong vi tri id_collaborator co trong info_linked_collaborator hay khong
                const findExistIndexInfoLinked = getListOrder[i].info_linked_collaborator.findIndex((a) => a.id_collaborator.toString() === getCollaborator._id.toString());
                
                // Thay doi trang thai tat ca cac phan tu khac voi vi tri id_collaborator (neu co)
                for(let j = 0; j < getListOrder[i].info_linked_collaborator.length; j++) {
                    if(findExistIndexInfoLinked !== j && getListOrder[i].info_linked_collaborator[j].status !== STATUS_ORDER.cancel) {
                        getListOrder[i].info_linked_collaborator[j].status = STATUS_ORDER.cancel
                    }
                }

                // Neu co vi tri id_collaborator tac thi thay doi trang thai
                // Neu khong co thi day thong tin vao info_linked_collaborator
                if(findExistIndexInfoLinked > -1) {
                    getListOrder[i].info_linked_collaborator[findExistIndexInfoLinked].status = STATUS_ORDER.confirm
                } else {
                    getListOrder[i].info_linked_collaborator.push(newInfoLinked)
                }

                getListOrder[i].id_collaborator = getCollaborator._id;
                getListOrder[i].name_collaborator = getCollaborator.full_name;
                getListOrder[i].phone_collaborator = getCollaborator.phone;
                getListOrder[i].index_search_collaborator = getCollaborator.index_search
                
                lstTask.push(this.orderOopSystemService.updateOrder(lang, getListOrder[i]))
            }

            payloadDependency.group_order = await this.groupOrderOopSystemService.updateGroupOrder(lang, getGroupOrder)
            await Promise.all(lstTask)

            // 5. Hoan tien cho doi tac cu
            if(getOrder.payment_method === PAYMENT_METHOD.cash || getOrder.subtotal_fee === getOrder.initial_fee) {
                payloadDependency.collaborator = getOldCollaborator
                await this.refundMoneyForCollaborator(lang, payloadDependency)
            }
            
            payloadDependency.collaborator = getCollaborator
            await this.historyActivityOopSystemService.changeCollaborator(lang, payloadDependency);
            await this.notificationSystemService.changeCollaborator(lang, payloadDependency)

            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    
    async refundMoneyForCollaborator(lang, payloadDependency) {
        try {
            const order = payloadDependency.order
            const collaborator = payloadDependency.collaborator
            const previousBalance = {
                collaborator_wallet: collaborator.collaborator_wallet,
                work_wallet: collaborator.work_wallet
            }

            let refundCollaborator = 0
            if (order.subtotal_fee !== order.initial_fee) {
                if (order.payment_method === PAYMENT_METHOD.cash) {
                    refundCollaborator = order.work_shift_deposit; 
                }
            } else {
                // Giu lai cach tinh gia cu
                refundCollaborator = order.platform_fee + order.pending_money;
            }

            payloadDependency.collaborator = await this.collaboratorOopSystemService.addPointWallet(lang, collaborator._id, "work_wallet", refundCollaborator);
            await this.historyActivityOopSystemService.refundPointWalletCollaborator({type: "system", _id: null}, payloadDependency, previousBalance, refundCollaborator);
            await this.notificationSystemService.refundCollaborator(lang, payloadDependency, refundCollaborator);

            return payloadDependency
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    
    async refundMoneyWhenCompletingOrder(lang, subjectAction, payloadDependency) {
        try {
            const order = payloadDependency.order
            const groupOrder = payloadDependency.group_order
            const collaborator = payloadDependency.collaborator

            let refundMoney = 0
            const previousBalance: previousBalanceCollaboratorDTO = {
                collaborator_wallet: collaborator.collaborator_wallet,
                work_wallet: collaborator.work_wallet,
            }
            if (order.subtotal_fee !== order.initial_fee) {
                refundMoney = order.net_income; // doi tac nhan so tien thuc nhan cua ca, thay vi nhan so tien chenh lech
            } else {
                // Giu lai cach tinh gia cu
                if (order.payment_method === PAYMENT_METHOD.cash) {
                    refundMoney = order.refund_money
                } else {
                    refundMoney = order.final_fee + order.refund_money
                }
            }
            payloadDependency.collaborator = await this.collaboratorOopSystemService.addPointWallet(lang, collaborator._id, TYPE_WALLET.collaborator_wallet, refundMoney)
            await this.historyActivityOopSystemService.receiveRefundMoney(subjectAction, payloadDependency, previousBalance, refundMoney)

            if(payloadDependency.collaborator.collaborator_wallet < 0) {
                await this.balanceMoney(lang, subjectAction, payloadDependency)
            }

            await this.notificationSystemService.receiveRefundMoney(lang, groupOrder._id, order, collaborator, refundMoney)

            return payloadDependency
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async minusRemainingShiftDeposit(lang, subjectAction, payloadDependency) {
        try {
            const getOrder = payloadDependency.order
            const getGroupOrder = payloadDependency.group_order
            let getCollaborator = payloadDependency.collaborator

            const chargeFee = getOrder.remaining_shift_deposit
            const previousBalance: previousBalanceCollaboratorDTO = {
                work_wallet: getCollaborator.work_wallet,
                collaborator_wallet: getCollaborator.collaborator_wallet
            }
            getCollaborator = await this.collaboratorOopSystemService.minusCollaborator(lang, getCollaborator._id, chargeFee, TYPE_GROUP_ORDER.schedule, TYPE_ACTION.other)
            payloadDependency.collaborator = getCollaborator;
            // Log he thong va ban thong bao tru tien
            await this.historyActivityOopSystemService.minusRemainingShiftDeposit(subjectAction, payloadDependency, chargeFee, previousBalance)
            await this.notificationSystemService.minusRemainingShiftDeposit(lang, getGroupOrder._id, getOrder, getCollaborator, chargeFee)

            return payloadDependency;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    
    async updateAddressForOrder(lang, subjectAction, idOrder, payload) {
        try {
            // Kiem tra co truyen token dia chi xuong hay khong
            // Neu khong thi bao loi
            if (payload.token === null || payload.token === undefined || payload.token === "") {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.ADDRESS_CANNOT_BE_EMPTY, lang, 'address')], HttpStatus.BAD_REQUEST);
            }
            let payloadDependency = {
                group_order: null,
                admin_action: null,
                order: null
            }
            let getOrder = await this.orderOopSystemService.getDetailItem(lang, idOrder)
            let getGroupOrder = await this.groupOrderOopSystemService.getDetailItem(lang, getOrder.id_group_order)

            if(subjectAction.type === "admin") {
                const getUser = await this.userSystemOoopSystemService.getDetailItem(lang, subjectAction._id)
                payloadDependency.admin_action = getUser
            }
            const convertToken = await this.generalHandleService.decryptObject(payload.token);
            
            getGroupOrder.lat = convertToken.lat.toString()
            getGroupOrder.lng = convertToken.lng.toString()
            getGroupOrder.address = convertToken.address

            getGroupOrder = await this.groupOrderOopSystemService.updateGroupOrder(lang, getGroupOrder)
            await this.orderOopSystemService.updateAddressOrderByGroupOrder(getGroupOrder._id, convertToken)
            payloadDependency.group_order = getGroupOrder

            await this.historyActivityOopSystemService.updateAddressForOrder(subjectAction, payloadDependency)

            return true
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getNextDateOfLoopGroupOrder(groupOrder) {
        try {
            const currentDate = new Date(groupOrder.date_work_schedule[0].date).getTime();
            let nextDate;

            if (groupOrder.day_loop) {
                if (groupOrder.day_loop.length > 0) {
                    const activeDay = await this.generalHandleService.formatDateWithTimeZone(new Date(groupOrder.date_work_schedule[0].date), groupOrder.time_zone ? groupOrder.time_zone : 'Asia/Ho_Chi_Minh')
                    let tempArrDayLoop = await this.generalHandleService.removeDuplicateValueArr(groupOrder.day_loop);
                    let arrDayLoop = tempArrDayLoop.sort((a, b) => a - b)
                    if (arrDayLoop[0] === 0) {
                        arrDayLoop.shift();
                        arrDayLoop.push(0);
                    }
                    let nextDay = undefined;

                    for (let i = 0; i < arrDayLoop.length; i++) {
                        if (arrDayLoop[i] === 0) {
                            nextDay = 0;
                            break;
                        } else if (arrDayLoop[i] > activeDay.day_of_week) {
                            nextDay = arrDayLoop[i];
                            break;
                        } else if (i === arrDayLoop.length - 1) {
                            nextDay = arrDayLoop[0];
                            break;
                        }
                    }
                    if (nextDay === 0) {
                        nextDate = nextSunday(new Date(groupOrder.date_work_schedule[0].date)).toISOString();
                    } else if (nextDay === 1) {
                        nextDate = nextMonday(new Date(groupOrder.date_work_schedule[0].date)).toISOString();
                    } else if (nextDay === 2) {
                        nextDate = nextTuesday(new Date(groupOrder.date_work_schedule[0].date)).toISOString();
                    } else if (nextDay === 3) {
                        nextDate = nextWednesday(new Date(groupOrder.date_work_schedule[0].date)).toISOString();
                    } else if (nextDay === 4) {
                        nextDate = nextThursday(new Date(groupOrder.date_work_schedule[0].date)).toISOString();
                    } else if (nextDay === 5) {
                        nextDate = nextFriday(new Date(groupOrder.date_work_schedule[0].date)).toISOString();
                    } else if (nextDay === 6) {
                        nextDate = nextSaturday(new Date(groupOrder.date_work_schedule[0].date)).toISOString();
                    } else {
                        nextDate = new Date(currentDate + 7 * 24 * 60 * 60 * 1000).toISOString();
                    }
                } else {
                    nextDate = new Date(currentDate + 7 * 24 * 60 * 60 * 1000).toISOString();
                }
            } else {
                nextDate = new Date(currentDate + 7 * 24 * 60 * 60 * 1000).toISOString();
            }

            return nextDate
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async createLoopGroupOrder(lang, groupOrder) {
        try {    
            const subjectAction = {
                type: TYPE_SUBJECT_ACTION.system,
                _id: null
            }
            if(groupOrder.payment_method === PAYMENT_METHOD.cash || groupOrder.payment_method === PAYMENT_METHOD.point) {
                let payloadDependency = {
                    customer: null,
                    group_order: null,
                    collaborator: null,
                    admin_action: null,
                    order: null
                }
    
                // 1. Lấy ngày tiếp theo để tạo group order
                const nextDate = await this.getNextDateOfLoopGroupOrder(groupOrder)

                // 2. Lấy danh sách từ group order hiện tại
                const arrExtend: any = [];
                for (const optional of groupOrder.service.optional_service) {
                    for (const extend of optional.extend_optional) {
                        arrExtend.push({
                            _id: extend._id.toString(),
                            count: Number(extend.count)
                        })
                    }
                }
                const getCustomer = await this.customerOopSystemService.getDetailItem(lang, groupOrder.id_customer);
                payloadDependency.customer = getCustomer
    
                const address = {
                    lat: groupOrder.lat,
                    lng: groupOrder.lng,
                    address: groupOrder.address,
                    type_address_work: groupOrder.type_address_work,
                    note_address: groupOrder.note_address
                }

                // 3. Tạo ra payload để tính toán phí của group order
                const token = await this.globalService.encryptObject(address);
                const newPayload = {
                    token: token,
                    date_work_schedule: [nextDate],
                    is_auto_order: groupOrder.is_auto_order,
                    time_schedule: null,
                    code_promotion: "",
                    extend_optional: arrExtend,
                    note: groupOrder.note,
                    payment_method: groupOrder.payment_method,
                    id_customer: getCustomer._id,
                    day_loop: groupOrder.day_loop,
                    time_zone: groupOrder.time_zone
                }
    
                const codePayloadArea = await this.identifyArea(newPayload);
    
                const infoJob = await this.calculateFeeGroupOrder(lang, newPayload, subjectAction);

                // 4. check phuong thuc thanh toan cua KH
                if( groupOrder.payment_method === PAYMENT_METHOD.point) {
                    const checkBalance = await this.customerOopSystemService.checkBalancePayPoint(lang, groupOrder.id_customer, infoJob.final_fee, true)
                    if(!checkBalance) {
                        await this.notificationSystemService.notHaveEnoughBalance(lang, getCustomer)
                        return true
                    }
                }

                // 5. tao group order
                const createGroupOrder = await this.groupOrderOopSystemService.createItem(lang, infoJob, newPayload, codePayloadArea, getCustomer)
                payloadDependency.group_order = createGroupOrder

                // 6. tao ra order rieng le
            const listOrder = await this.orderOopSystemService.createOrderByGroupOrder(lang, createGroupOrder, infoJob)
            payloadDependency.order = await this.groupOrderOopSystemService.updateListOrder(lang, createGroupOrder, listOrder)

                // 7. tru tien KH
                if (createGroupOrder.payment_method === PAYMENT_METHOD.point) {
                    let customer = await this.customerOopSystemService.redeemPayPoint(lang, groupOrder.id_customer, infoJob.final_fee)
                    payloadDependency.customer = customer;
                    await this.historyActivityOopSystemService.paymentPayPointCustomer(subjectAction, payloadDependency, infoJob.final_fee)
                }

                await this.historyActivityOopSystemService.createLoopGroupOrder(subjectAction, payloadDependency)

                await this.notificationSystemService.createGroupOrder(lang, subjectAction, payloadDependency, getCustomer, true)
            }
            return true;

        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    
    async balanceMoney(lang, subjectAction, payloadDependency) {
        try {
            let collaborator = payloadDependency.collaborator
            const previousBalance = {
                collaborator_wallet: collaborator.collaborator_wallet,
                work_wallet: collaborator.work_wallet
            }

            collaborator.work_wallet += collaborator.collaborator_wallet
            collaborator.collaborator_wallet = 0

            await this.historyActivityOopSystemService.balanceMoney(subjectAction, payloadDependency, previousBalance, previousBalance.collaborator_wallet)
            await this.collaboratorOopSystemService.updateCollaborator(lang, collaborator);

            return true
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    async removeDuplicateMinusPlatformFeeType(lang, subjectAction) {
        try {
            const lstGroupOrder = await this.groupOrderOopSystemService.getListGroupOrderDuplicateMinusPlatformFee()

            const lstTask:any = []
            for(let i = 0; i < lstGroupOrder.length; i++) {
                const lstOrder = await this.orderOopSystemService.getListOrderByGroupOrderAndStatus(lstGroupOrder[i]._id) 
                if(lstGroupOrder[i].id_collaborator.toString() === lstOrder[0].id_collaborator.toString()) {
                    const lstHistoryActivities = await this.historyActivityOopSystemService.getListByTypeAndIdGroupOrder(lstGroupOrder[i]._id, "system_minus_new_platform_fee")
                    if(lstHistoryActivities.length > 1) {
                        const duration = new Date(lstHistoryActivities[1].date_create).getTime() - new Date(lstHistoryActivities[0].date_create).getTime()
                        if(duration <= 60 * 1000) {
                            // Xóa log cuối cùng trong mảng
                            await this.historyActivityOopSystemService.permanentlyDeleteItem(lang, lstHistoryActivities[1]._id)
                            // Hoàn tiền cho đối tác và chạy lại log
                            await this.balanceMoneyForCollaborator(lang, lstHistoryActivities[1].id_collaborator, lstHistoryActivities[1].date_create, lstHistoryActivities[1].current_work_wallet, lstHistoryActivities[1].value)
                        }
                    }
                } else if(lstGroupOrder[i].id_collaborator.toString() !== lstOrder[0].id_collaborator.toString()) {
                    // Ghi lại log
                    const payloadDependency = {
                        group_order: lstGroupOrder[i]
                    }
                    await this.historyActivityOopSystemService.logErrorGroupOrder(subjectAction, payloadDependency)
                }
                
                lstGroupOrder[i].is_check_duplicate = false
                lstTask.push(this.groupOrderOopSystemService.updateGroupOrder(lang, lstGroupOrder[i]))
            }            

            await Promise.all(lstTask)

            return true
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async balanceMoneyForCollaborator(lang, idCollaborator, time, current_work_wallet, minusFee) {
        try {
            const getCollaborator = await this.collaboratorOopSystemService.getDetailItem(lang, idCollaborator)
            const getHistoryActivity = await this.historyActivityOopSystemService.getItemBeforeASpecificTimeByCollaborator(idCollaborator, time)
            let currentWorkWallet = current_work_wallet + Math.abs(minusFee)
            let currentCollaboratorWallet = getCollaborator.collaborator_wallet
            let getListHistoryActivites = []
            if(!getHistoryActivity) {
                getListHistoryActivites = await this.historyActivityOopSystemService.getHistoryRemainderByCollaborator(idCollaborator)
            } else {
                getListHistoryActivites = await this.historyActivityOopSystemService.getHistoryRemainderByCollaborator(idCollaborator, getHistoryActivity.date_create)
                if(getListHistoryActivites.length > 0) {
                    const firstHistoryActivites = getListHistoryActivites.shift()
                    currentWorkWallet = firstHistoryActivites.current_work_wallet
                    currentCollaboratorWallet = firstHistoryActivites.current_collaborator_wallet
                }
            }

            const lstTask:any = []

            for(let i = 0; i < getListHistoryActivites.length; i++ ) {
                if(getListHistoryActivites[i].status_current_work_wallet ===  'up' || getListHistoryActivites[i].status_current_work_wallet ===  'down') {
                    if(getListHistoryActivites[i].status_current_work_wallet === 'down') {
                        getListHistoryActivites[i].current_work_wallet = currentWorkWallet
                        getListHistoryActivites[i].current_work_wallet -= Math.abs(getListHistoryActivites[i].value)
                        currentWorkWallet = getListHistoryActivites[i].current_work_wallet
                    } 
                    if(getListHistoryActivites[i].status_current_work_wallet ===  'up') {
                        getListHistoryActivites[i].current_work_wallet = currentWorkWallet
                        getListHistoryActivites[i].current_work_wallet += Math.abs(getListHistoryActivites[i].value)
                        currentWorkWallet = getListHistoryActivites[i].current_work_wallet
                    }
                } else {
                    getListHistoryActivites[i].current_work_wallet = currentWorkWallet
                }

                if(getListHistoryActivites[i].status_current_collaborator_wallet ===  'up' || getListHistoryActivites[i].status_current_collaborator_wallet ===  'down') {
                    if(getListHistoryActivites[i].status_current_collaborator_wallet === 'down') {
                        getListHistoryActivites[i].current_collaborator_wallet = currentCollaboratorWallet
                        getListHistoryActivites[i].current_collaborator_wallet -= Math.abs(getListHistoryActivites[i].value)
                        currentCollaboratorWallet = getListHistoryActivites[i].current_collaborator_wallet
                    } 
                    if (getListHistoryActivites[i].status_current_collaborator_wallet ===  'up') {
                        getListHistoryActivites[i].current_collaborator_wallet = currentCollaboratorWallet
                        getListHistoryActivites[i].current_collaborator_wallet += Math.abs(getListHistoryActivites[i].value)
                        currentCollaboratorWallet = getListHistoryActivites[i].current_collaborator_wallet
                    } 
                } else {
                    getListHistoryActivites[i].current_collaborator_wallet = currentCollaboratorWallet
                }
                lstTask.push(this.historyActivityOopSystemService.updateHistoryActivity(lang, getListHistoryActivites[i]))
            }
    
            getCollaborator.collaborator_wallet = currentCollaboratorWallet
            getCollaborator.work_wallet = currentWorkWallet

            await this.collaboratorOopSystemService.updateCollaborator(lang, getCollaborator)
            await Promise.all(lstTask)
        
            return true
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
<<<<<<< HEAD
        }
=======
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
>>>>>>> son
}
