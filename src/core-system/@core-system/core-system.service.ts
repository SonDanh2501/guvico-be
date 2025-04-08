import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CollaboratorRepositoryService } from 'src/@repositories/repository-service/collaborator-repository/collaborator-repository.service';
import { CustomerRepositoryService } from 'src/@repositories/repository-service/customer-repository/customer-repository.service';
import { GroupOrderRepositoryService } from 'src/@repositories/repository-service/group-order-repository/group-order-repository.service';
import { OrderRepositoryService } from 'src/@repositories/repository-service/order-repository/order-repository.service';
import { ReasonsCancelRepositoryService } from 'src/@repositories/repository-service/reasons-cancel-repository/reasons-cancel-repository.service';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { HandleLogicSystemService } from '../handle-logic-system/handle-logic-system.service';
import { CollaboratorSystemService } from '../collaborator-system/collaborator-system.service';
import { OrderSystemService } from '../order-system/order-system.service';
import { CustomerSystemService } from '../customer-system/customer-system.service';
import { ERROR, MILLISECOND_IN_HOUR, stepCancelDTO } from 'src/@core';
import { PunishTicketSystemService } from '../punish-ticket-system/punish-ticket-system.service';
import { createPunishTicketFromPolicyDTO } from 'src/@core/dto/punishTicket.dto';
import { ActivitySystemService } from '../activity-system/activity-system.service';
import { TransactionRepositoryService } from 'src/@repositories/repository-service/transaction-repository/transaction-repository.service';
import { TransactionSystemService } from '../transaction-system/transaction-system.service';
import { GroupOrderSystemService } from '../group-order-system/group-order-system.service';
// import { OrderOopSystemService } from '../@oop-system/order-oop-system/order-oop-system.service';

@Injectable()
export class CoreSystemService {
    constructor(
        private groupOrderSystemService: GroupOrderSystemService,
        private orderSystemService: OrderSystemService,
        private collaboratorSystemService: CollaboratorSystemService,
        private customerSystemService: CustomerSystemService,
        private punishTicketSystemService: PunishTicketSystemService,
        private activitySystemService: ActivitySystemService,
        private handleLogicSystemService: HandleLogicSystemService,
        private transactionSystemService: TransactionSystemService,


        private orderRepositoryService: OrderRepositoryService,
        private reasonsCancelRepositoryService: ReasonsCancelRepositoryService,
        private groupOrderRepositoryService: GroupOrderRepositoryService,
        private customerRepositoryService: CustomerRepositoryService,
        private collaboratorRepositoryService: CollaboratorRepositoryService,
        private transactionRepositoryService: TransactionRepositoryService,

        // private orderOopSystemService: OrderOopSystemService,
        // private orderSystemService: OrderSystemService,
        

        private customExceptionService: CustomExceptionService,
    ) {}


    async cancelOrder(lang, subjectAction, idOrder, idCancel, stepCancel: stepCancelDTO) {
        try {
            
            const getOrder = await this.orderRepositoryService.findOneById(idOrder);
            if(!getOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "order")], HttpStatus.NOT_FOUND);
            const getGroupOrder = await this.groupOrderRepositoryService.findOneById(getOrder.id_group_order)
            if(!getGroupOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "group_order")], HttpStatus.NOT_FOUND);
            const getCustomer = await this.customerRepositoryService.findOneById(getOrder.id_customer)
            if(!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "customer")], HttpStatus.NOT_FOUND);
            const getReasonCancel = await this.reasonsCancelRepositoryService.findOneById(idCancel);
            if(!getReasonCancel) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "reason_cancel")], HttpStatus.NOT_FOUND);

            const refundCollaborator = getOrder.platform_fee + getOrder.pending_money;


            // kiem tra xem don hang bi huy la don dau tien hay la don 
            const query = {
                $and: [
                    {id_group_order: getOrder.id_group_order},
                    {status: {$in: ["confirm", "doing"]}},
                    { date_work: { $lt: getOrder.date_work }}
                ]
            }

            const checkPreviousOrder = await this.orderRepositoryService.findOne(query);
            if(checkPreviousOrder) {  
                stepCancel.isRefundCollaborator = false;
                stepCancel.isMinusNextOrderCollaborator = false;
            } 

            let resultCancel = {
                order: {},
                refundCustomer: 0
            }
            // // 1. huy don
            if(stepCancel.isCancel === true) {
                resultCancel = await this.orderSystemService.cancelOrder(lang, subjectAction, idOrder, idCancel);
            }
            
            // 2. hoan tien cho KH
            if(stepCancel.isRefundCustomer === true) {
                if(getOrder.payment_method === 'point') {
                    await this.customerSystemService.refundMoney(lang, {type: "system", _id: null}, getCustomer._id, resultCancel.refundCustomer, getOrder.payment_method, getOrder.id_group_order, getOrder._id);
                }
            }

            // 3. hoan tien cho CTV
            if(stepCancel.isRefundCollaborator === true) {
                if(getOrder.id_collaborator !== null) {
                    await this.collaboratorSystemService.refundMoney(lang, {type: "system", _id: null}, getOrder.id_collaborator, refundCollaborator, "work_wallet", getOrder.id_group_order, getOrder)
                }
            }


            // 4. check xem co phat CTV hay ko
            if(stepCancel.isPunishCollaborator === true) {
                const getCollaborator = await this.collaboratorRepositoryService.findOneById(getOrder.id_collaborator);
                if(!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "collaborator")], HttpStatus.NOT_FOUND);

                const dateWork = new Date(getOrder.date_work).getTime();
                const dateNow = new Date(Date.now()).getTime();
                const timeCancelJob = dateWork - dateNow;
                let payload: createPunishTicketFromPolicyDTO = {
                    id_collaborator: getOrder.id_collaborator,
                    id_punish_policy: '',
                    id_order: getOrder._id,
                    is_verify_now: true,
                }
                const previousBalance = {
                    work_wallet: getCollaborator.work_wallet,
                    collaborator_wallet: getCollaborator.collaborator_wallet,
                }
                if (timeCancelJob < 2 * MILLISECOND_IN_HOUR) {
                    payload.id_punish_policy = '6634662361c1079edc4cf069';
                } else if (timeCancelJob < 8 * MILLISECOND_IN_HOUR) {
                    payload.id_punish_policy = '6634664761c1079edc4cf09a';
                } else {
                    payload.id_punish_policy = '6634666f61c1079edc4cf0b6';
                }
                let ticket = await this.punishTicketSystemService.createPunishTicketFromPolicy("vi", payload);
                await this.activitySystemService.createPunishTicket(ticket);
                ticket = await this.punishTicketSystemService.standbyToWaitingPunishTicket("vi", ticket);
                const punishTicket = await this.punishTicketSystemService.waitingToDoingPunishTicket("vi", ticket);
                const transaction = await this.transactionRepositoryService.findOneById(punishTicket.id_transaction);
                if (transaction) {
                    await this.activitySystemService.createTransaction(transaction);
                    await this.transactionSystemService.verifyTransaction('vi', ticket.id_transaction);
                    await this.activitySystemService.verifyPunishCollaboratorTransaction(transaction, previousBalance)
                }
                await this.punishTicketSystemService.doingToDonePunishTicket('vi', punishTicket);
            }

            // 5 check xem co phat KH hay ko
            if(stepCancel.isPunishCustomer === true) {
                
            }

            // 6. check xen co day CTV ra ko, hien tai khi day don se day ra tat ca ca lam cua dich vu do
            if(stepCancel.isUnassignCollaborator === true) {
                // await this.orderSystemService.unassignCollaboratorFromOrder(lang, subjectAction, idOrder);
                await this.groupOrderSystemService.unassignCollaboratorFromGroupOrder(lang, subjectAction, getGroupOrder._id, getOrder);
            }

            // 7 xu ly tru tien cho don tiep theo, 
            if(stepCancel.isMinusNextOrderCollaborator === true) {
                const nextOrder = await this.orderSystemService.findNextOrderInGroupOrder(lang, idOrder);
                if(nextOrder) {
                    const minusFee = nextOrder.platform_fee + nextOrder.pending_money;
                    await this.collaboratorSystemService.minusPlatformFee(lang, {type: "system", _id: null}, "work_wallet", nextOrder.id_collaborator, nextOrder, minusFee)
                }
            }

            return true;
        } catch(err) {
            await this.handleLogicSystemService.exceptionHandle(err)
        }
    }


    async cancelGroupOrder(lang, subjectAction, idGroupOrder, idCancel, stepCancel: stepCancelDTO) {
        try {
            const getGroupOrder = await this.groupOrderRepositoryService.findOneById(idGroupOrder)
            if(!getGroupOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "group_order")], HttpStatus.NOT_FOUND);
            const getCustomer = await this.customerRepositoryService.findOneById(getGroupOrder.id_customer)
            if(!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "customer")], HttpStatus.NOT_FOUND);
            // lay ca lam dang lam hien tai de hoan phi cho CTV
            const findOrderCurrent = await this.orderSystemService.findCurrentOrderInGroupOrder(lang, idGroupOrder)
            let currentOrder = {
                nearOrder: findOrderCurrent,
                refundCollaborator: findOrderCurrent.pending_money + findOrderCurrent.platform_fee
            };
            // const refundCollaborator = getOrder.platform_fee + getOrder.pending_money;


            let resultCancel: any;
            // let resultCancel = {
            //     groupOrder: {},
            //     nearOrder: {},
            //     refundCustomer: 0,
            //     refundCollaborator: 0
            // }
            // // 1. huy don

            if(stepCancel.isCancel === true) {
                const getReasonCancel = await this.reasonsCancelRepositoryService.findOneById(idCancel);
                if(!getReasonCancel) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "reason_cancel")], HttpStatus.NOT_FOUND);
                resultCancel = await this.groupOrderSystemService.cancelGroupOrder(lang, subjectAction, getGroupOrder, getReasonCancel);
            } else {

            }
            
            // 2. hoan tien cho KH

            if(stepCancel.isRefundCustomer === true) {
                if(getGroupOrder.payment_method === 'point') {
                    await this.customerSystemService.refundMoney(lang, {type: "system", _id: null}, getCustomer._id, resultCancel.refundCustomer, getGroupOrder.payment_method, getGroupOrder._id, findOrderCurrent._id);
                }
            }

            // 3. hoan tien cho CTV
            if(stepCancel.isRefundCollaborator === true) {
                if(getGroupOrder.id_collaborator !== null) {
                    await this.collaboratorSystemService.refundMoney(lang, {type: "system", _id: null}, getGroupOrder.id_collaborator, currentOrder.refundCollaborator, "work_wallet", getGroupOrder._id, currentOrder.nearOrder)
                }
            }
            

            // 4. check xem co phat CTV hay ko
            if(stepCancel.isPunishCollaborator === true) {
                const getCollaborator = await this.collaboratorRepositoryService.findOneById(getGroupOrder.id_collaborator);
                if(!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "collaborator")], HttpStatus.NOT_FOUND);

                const dateWork = new Date(currentOrder.nearOrder.date_work).getTime();
                const dateNow = new Date(Date.now()).getTime();
                const timeCancelJob = dateWork - dateNow;
                let payload: createPunishTicketFromPolicyDTO = {
                    id_collaborator: currentOrder.nearOrder.id_collaborator,
                    id_punish_policy: '',
                    id_order: currentOrder.nearOrder._id,
                    is_verify_now: true,
                }
                const previousBalance = {
                    work_wallet: getCollaborator.work_wallet,
                    collaborator_wallet: getCollaborator.collaborator_wallet,
                }
                if (timeCancelJob < 2 * MILLISECOND_IN_HOUR) {
                    payload.id_punish_policy = '6634662361c1079edc4cf069';
                } else if (timeCancelJob < 8 * MILLISECOND_IN_HOUR) {
                    payload.id_punish_policy = '6634664761c1079edc4cf09a';
                } else {
                    payload.id_punish_policy = '6634666f61c1079edc4cf0b6';
                }
                let ticket = await this.punishTicketSystemService.createPunishTicketFromPolicy("vi", payload);
                await this.activitySystemService.createPunishTicket(ticket);
                ticket = await this.punishTicketSystemService.standbyToWaitingPunishTicket("vi", ticket);
                const punishTicket = await this.punishTicketSystemService.waitingToDoingPunishTicket("vi", ticket);
                const transaction = await this.transactionRepositoryService.findOneById(punishTicket.id_transaction);
                if (transaction) {
                    await this.activitySystemService.createTransaction(transaction);
                    await this.transactionSystemService.verifyTransaction('vi', ticket.id_transaction);
                    await this.activitySystemService.verifyPunishCollaboratorTransaction(transaction, previousBalance)
                }
                await this.punishTicketSystemService.doingToDonePunishTicket('vi', punishTicket);
            }

            // 5 check xem co phat KH hay ko
            if(stepCancel.isPunishCustomer === true) {
                
            }

            // 6. check xen co day CTV ra ko, huy ca goi dich vu ko ap dung cho collaborator nen ko can buoc nay
            if(stepCancel.isUnassignCollaborator === true) {
                await this.groupOrderSystemService.unassignCollaboratorFromGroupOrder(lang, subjectAction, idGroupOrder, currentOrder.nearOrder);
            }

            // 7 xu ly tru tien cho don tiep theo, vi huy ca goi dich vu nen ko can tinh buoc nay
            if(stepCancel.isMinusNextOrderCollaborator === true) {
                // const nextOrder = await this.orderSystemService.findNextOrderInGroupOrder(lang, idOrder);
                // const minusFee = nextOrder.platform_fee + nextOrder.pending_money;
                // await this.collaboratorSystemService.minusPlatformFee(lang, "system", nextOrder.id_collaborator, nextOrder, minusFee)
            }

            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // async cancelGroupOrder() {
    //     try {

    //     } catch (err) {

    //     }
    // }
}
