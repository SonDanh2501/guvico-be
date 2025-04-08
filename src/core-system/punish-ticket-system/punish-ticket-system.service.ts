import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { ERROR, GlobalService } from 'src/@core'
import { createPunishTicketFromPolicyDTO } from 'src/@core/dto/punishTicket.dto'
import { PunishTicketDocument, UserSystemDocument } from 'src/@repositories/module/mongodb/@database'
import { PUNISH_LOCK_TIME_TYPE } from 'src/@repositories/module/mongodb/@database/enum'
import { CollaboratorRepositoryService } from 'src/@repositories/repository-service/collaborator-repository/collaborator-repository.service'
import { CustomerRepositoryService } from 'src/@repositories/repository-service/customer-repository/customer-repository.service'
import { HistoryActivityRepositoryService } from 'src/@repositories/repository-service/history-activity-repository/history-activity-repository.service'
import { OrderRepositoryService } from 'src/@repositories/repository-service/order-repository/order-repository.service'
import { PunishPolicyRepositoryService } from 'src/@repositories/repository-service/punish-policy-repository/punish-policy-repository.service'
import { PunishTicketRepositoryService } from 'src/@repositories/repository-service/punish-ticket-repository/punish-ticket-repository.service'
import { TransactionRepositoryService } from 'src/@repositories/repository-service/transaction-repository/transaction-repository.service'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service'
import { ActivityAdminSystemService } from '../activity-admin-system/activity-admin-system.service'
import { ActivityCollaboratorSystemService } from '../activity-collaborator-system/activity-collaborator-system.service'
import { ActivityCustomerSystemService } from '../activity-customer-system/activity-customer-system.service'
import { ActivitySystemService } from '../activity-system/activity-system.service'
import { TransactionSystemService } from '../transaction-system/transaction-system.service'

@Injectable()
export class PunishTicketSystemService {
    constructor(
        private punishTicketRepositoryService: PunishTicketRepositoryService,
        private punishPolicyRepositoryService: PunishPolicyRepositoryService,
        private orderRepositoryService: OrderRepositoryService,
        private transactionSystemService: TransactionSystemService,
        private activitySystemService: ActivitySystemService,
        private activityAdminSystemService: ActivityAdminSystemService,
        private globalService: GlobalService,
        private customExceptionService: CustomExceptionService,
        private generalHandleService: GeneralHandleService,
        private collaboratorRepositoryService: CollaboratorRepositoryService,
        private customerRepositoryService: CustomerRepositoryService,
        private activityCollaboratorSystemSerivice: ActivityCollaboratorSystemService,
        private activityCustomerSystemSerivice: ActivityCustomerSystemService,
        private transactionRepositoryService: TransactionRepositoryService,
        private historyActivityRepositoryService: HistoryActivityRepositoryService,
    ) { }

    /**
     * 
     * @param lang ngôn ngữ trả lỗi
     * @param payload thông tin cần thiết để tạo vé phạt
     * @param actor đối tượng thực hiện hành động
     * @note không có log lịch sử trong hàm này, nếu gọi ở đâu thì log lịch sử nơi đó 
     */
    async createPunishTicketFromPolicy(lang, payload: createPunishTicketFromPolicyDTO, actor?) {
        try {
            // actor là người tạo vé phạt(nếu undefined có nghĩa là hệ thống tạo)
            const getPolicy = await this.punishPolicyRepositoryService.findOneById(payload.id_punish_policy);
            if (!getPolicy) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, 'id_punish_policy')], HttpStatus.NOT_FOUND);
            if (getPolicy.status === 'pause' || getPolicy.status === 'standby') throw new HttpException([await this.customExceptionService.i18nError(ERROR.POLICY_NOT_AVAILABLE, lang, 'punish_policy')], HttpStatus.FORBIDDEN);
            let getOrder;
            if (payload.id_order) {
                getOrder = await this.orderRepositoryService.findOneById(payload.id_order);
                if (!getOrder) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ORDER_NOT_FOUND, lang, 'order')], HttpStatus.NOT_FOUND);
            }
            let punishMoney = getPolicy.punish_money;
            if (getPolicy.punish_money_type === "percent_of_initial_fee_order") {
                if (getOrder) {
                    // lam tron so tien phat
                    let initialFee = getOrder.initial_fee / 1000;
                    punishMoney = Number((initialFee * (getPolicy.punish_money / 100)).toFixed()) * 1000;
                }
            } else if (getPolicy.punish_money_type === 'unset') {
                punishMoney = payload.punish_money;
            }
            const idView = await this.generateRandomIdViewPunishTicket();
            const dateStartLock = payload.date_start_lock_time || new Date(Date.now()).toISOString();
            let dateEndLock = payload.date_start_lock_time || new Date(Date.now()).toISOString();
            switch (getPolicy.punish_lock_time_type) {
                case PUNISH_LOCK_TIME_TYPE.minute: {
                    const tempDateStart = new Date(dateStartLock).getTime();
                    dateEndLock = new Date(tempDateStart + (getPolicy.punish_lock_time * 60 * 1000)).toISOString()
                    break;
                }
                case PUNISH_LOCK_TIME_TYPE.hours: {
                    const tempDateStart = new Date(dateStartLock).getTime();
                    dateEndLock = new Date(tempDateStart + (getPolicy.punish_lock_time * 60 * 60 * 1000)).toISOString()
                    break;
                } default: {
                    dateEndLock = dateStartLock;
                    break;
                }
            }
            if (getPolicy.user_apply === 'collaborator') {
                payload.id_customer = null
                if (!payload.id_collaborator || payload.id_collaborator === '') throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, 'collaborator')], HttpStatus.NOT_FOUND);
            } else {
                payload.id_collaborator = null
                if (!payload.id_customer || payload.id_customer === '') throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, 'customer')], HttpStatus.NOT_FOUND);

            }
            const dataCreate = {
                id_customer: payload.id_customer,
                id_collaborator: payload.id_collaborator || null,
                id_order: payload.id_order || null,
                id_admin_action: actor?._id || null,
                date_create: new Date(Date.now()).toISOString(),
                title: getPolicy.title,
                user_apply: getPolicy.user_apply,
                status: "standby",
                id_transaction: null,
                punish_lock_time: getPolicy.punish_lock_time,
                current_total_time_process: 1,
                current_total_order_process: 1,
                id_punish_policy: payload.id_punish_policy,
                time_end: dateStartLock,
                time_start: dateEndLock,
                punish_money: punishMoney,
                id_view: idView,
                note_admin: payload.note_admin ? payload.note_admin : getPolicy.title['vi'],
                payment_out: getPolicy.payment_out,
                payment_in: 'cash_book',
                action_lock: getPolicy.action_lock,
            }
            let newItem = await this.punishTicketRepositoryService.create(dataCreate);
            if (getOrder) {
                getOrder.id_punish_ticket.push(newItem._id.toString());
                await this.orderRepositoryService.findByIdAndUpdate(getOrder._id, getOrder);
            }
            return newItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async doingToDonePunishTicket(lang, punishTicket: PunishTicketDocument, admin?) {
        try {
            if (punishTicket.status !== 'doing') throw new HttpException([await this.customExceptionService.i18nError(ERROR.DO_NOT_CHANGE_STATUS, lang, null)], HttpStatus.FORBIDDEN);
            punishTicket.status = 'done';
            const result = await this.punishTicketRepositoryService.findByIdAndUpdate(punishTicket._id, punishTicket);
            // this.activitySystemService.changePunishTicketStatus(result, 'doing', 'done', admin);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    // async standbyToDoingPunishTicket(punishTicket: PunishTicketDocument, admin) {
    //     try {
    //         punishTicket.status = 'waiting';
    //         const getPunishTicket = await this.punishTicketRepositoryService.findByIdAndUpdate(punishTicket._id, punishTicket);
    //         await this.activitySystemService.standbyToWaitingPunishTicket(getPunishTicket);
    //         return getPunishTicket;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    //     }
    // }

    async standbyToWaitingPunishTicket(lang, punishTicket: PunishTicketDocument, admin?: UserSystemDocument) {
        try {
            if (punishTicket.status !== 'standby') {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.DO_NOT_CHANGE_STATUS, lang, null)], HttpStatus.FORBIDDEN);
            }
            punishTicket.status = 'waiting';
            const result = await this.punishTicketRepositoryService.findByIdAndUpdate(punishTicket._id, punishTicket);
            // await this.activitySystemService.changePunishTicketStatus(result, 'standby', 'waiting', admin);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async standbyToCancelPunishTicket(lang, punishTicket: PunishTicketDocument, admin) {
        try {
            if (punishTicket.status !== 'standby') {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.DO_NOT_CHANGE_STATUS, lang, null)], HttpStatus.NOT_FOUND);
            }
            punishTicket.status = 'cancel';
            const result = await this.punishTicketRepositoryService.findByIdAndUpdate(punishTicket._id, punishTicket);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async waitingToDoingPunishTicket(lang, punishTicket: PunishTicketDocument, admin?) {
        try {
            console.log('waitingToDoingPunishTicket 1', punishTicket);
            if (punishTicket.status !== 'waiting') throw new HttpException([await this.customExceptionService.i18nError(ERROR.DO_NOT_CHANGE_STATUS, lang, null)], HttpStatus.NOT_FOUND);
            if (punishTicket.punish_money > 0) {
                const transaction = await this.transactionSystemService.createItem({
                    subject: punishTicket.id_collaborator !== null ? "collaborator" : "customer",
                    money: punishTicket.punish_money,
                    id_collaborator: punishTicket.id_collaborator,
                    id_customer: punishTicket.id_customer,
                    id_order: punishTicket.id_order,
                    id_punish_ticket: punishTicket._id,
                    id_admin_action: punishTicket.id_admin_action,
                    kind_transfer: "income",
                    type_transfer: "punish",
                    payment_out: punishTicket.payment_out,
                    payment_in: "cash_book"
                })
                punishTicket.id_transaction = transaction._id;
                this.activitySystemService.createTransaction(transaction);
            }
            punishTicket.status = 'doing';
            punishTicket.execution_date = new Date().toISOString()
            const result = await this.punishTicketRepositoryService.findByIdAndUpdate(punishTicket._id, punishTicket);
            // Cập nhật phiếu phạt trong đơn hàng
            const getOrder = await this.orderRepositoryService.findOneById(punishTicket.id_order)
            if(getOrder !== null && getOrder !== undefined) {
                const findIndexPunishTicket = getOrder.list_of_punish_ticket.findIndex((a) => a.id_punish_ticket.toString() === punishTicket._id.toString());
                if(findIndexPunishTicket > -1) {
                    getOrder.list_of_punish_ticket[findIndexPunishTicket].execution_date = new Date().toISOString()

                    await this.orderRepositoryService.findByIdAndUpdate(getOrder._id, getOrder)
                } 
            }
            // await this.activitySystemService.changePunishTicketStatus(result, 'waiting', 'doing', admin);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async revokeTicket(punishTicket: PunishTicketDocument, admin, lang) {
        try {
            await this.checkStatusPunishTicket(punishTicket, ["standby", "waiting", "processing", "out_date", "revoke", "cancel"], lang);
            if (punishTicket.punish_money > 0) {
                const getTransaction = await this.transactionRepositoryService.findOneById(punishTicket.id_transaction);
                if (!getTransaction) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, 'transaction')], HttpStatus.NOT_FOUND);
                if (getTransaction.status !== 'done') {
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.DO_NOT_CHANGE_STATUS, lang, 'transaction')], HttpStatus.NOT_FOUND);
                }
                const getCollaborator = await this.collaboratorRepositoryService.findOneById(punishTicket.id_collaborator);
                if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, 'collaborator')], HttpStatus.NOT_FOUND);
                const previousBalance = {
                    work_wallet: getCollaborator.work_wallet,
                    collaborator_wallet: getCollaborator.collaborator_wallet,
                };
                await this.transactionSystemService.giveBackMoney(getTransaction, getCollaborator);
                getTransaction.status = 'refund';
                await this.transactionRepositoryService.findByIdAndUpdate(getTransaction._id, getTransaction);
                //log lịch sử 
                //this.activityAdminSystemService.adminRevokeTicket(punishTicket, admin);
                this.activitySystemService.revokePunishTicket(punishTicket)
                this.activitySystemService.verifyTransactionRefundPunishTicket(punishTicket, previousBalance, admin);
                // this.activityCollaboratorSystemSerivice.revokePunishTicket(getCollaborator, previousBalance, getTransaction, punishTicket, admin);
            } else {
                this.activityAdminSystemService.adminRevokeTicket(punishTicket, admin);
            }
            const getOrder = await this.orderRepositoryService.findOneById(punishTicket.id_order)

            punishTicket.status = 'revoke';
            punishTicket.id_admin_action = admin._id;
            punishTicket.revocation_date = new Date().toISOString()

            await this.punishTicketRepositoryService.findByIdAndUpdate(punishTicket._id, punishTicket);

            // Cập nhật phiếu phạt trong order (nếu có)
            if(getOrder !== null && getOrder !== undefined) {
                const findIndexPunishTicket = getOrder.list_of_punish_ticket.findIndex((a) => a.id_punish_ticket.toString() === punishTicket._id.toString());
                if(findIndexPunishTicket > -1) {
                    getOrder.list_of_punish_ticket[findIndexPunishTicket].revocation_date = new Date().toISOString()
                    getOrder.total_refund_fee += punishTicket.punish_money

                    await this.orderRepositoryService.findByIdAndUpdate(getOrder._id, getOrder)
                } 
            }

            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async generateRandomIdViewPunishTicket() {
        const now = new Date();
        let tempRandomID = await this.globalService.randomIDTransition(4)
        const day = now.getDay() < 10 ? `0${now.getDay().toString()}` : now.getDay().toString();
        const month = now.getMonth() < 10 ? `0${now.getMonth().toString()}` : now.getMonth().toString();
        const year = now.getFullYear().toString()
        let idView = `#` + year + month + day + tempRandomID;
        let checkRandomID = await this.punishTicketRepositoryService.findOne({ id_view: idView });
        let a = 0;
        while (checkRandomID && a < 5) {
            tempRandomID = await this.globalService.randomIDTransition(4)
            idView = `#` + year + month + day + tempRandomID;
            checkRandomID = await this.punishTicketRepositoryService.findOne({ id_view: idView });
            a += 1;
        }
        return idView;
    }

    /**
 * 
 * @param order đơn hàng cần kiểm tra 
 * @param status các trạng thái cần kiểm tra
 * @param lang ngôn ngữ trả lỗi
 * @returns kiểm tra trạng thái đơn hàng với các status cần kiểm tra, trả lỗi nếu trạng thái của đơn hàng
 * trùng với 1 trong các trạng thái truyền vào 
 */
    async checkStatusPunishTicket(ticket: PunishTicketDocument, status: string[], lang) {
        try {
            for (let i of status) {
                if (i === 'cancel' && ticket.status === "cancel") {
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.PUNISH_TICKET.IS_CANCEL, lang, null)], HttpStatus.NOT_FOUND);
                }
                if (i === 'done' && ticket.status === "done") {
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.PUNISH_TICKET.IS_DONE, lang, null)], HttpStatus.NOT_FOUND);
                }
                if (i === 'doing' && ticket.status === "doing") {
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.PUNISH_TICKET.IS_DOING, lang, null)], HttpStatus.NOT_FOUND);
                }
                if (i === 'waiting' && ticket.status === "waiting") {
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.PUNISH_TICKET.IS_WAITING, lang, null)], HttpStatus.NOT_FOUND);
                }
                if (i === 'stanby' && ticket.status === "stanby") {
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.PUNISH_TICKET.IS_STANBY, lang, null)], HttpStatus.NOT_FOUND);
                }
                if (i === 'revoke' && ticket.status === "revoke") {
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.PUNISH_TICKET, lang, null)], HttpStatus.NOT_FOUND);
                }
                if (i === 'out_date' && ticket.status === "out_date") {
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.PUNISH_TICKET.IS_OUT_DATE, lang, null)], HttpStatus.NOT_FOUND);
                }
                if (i === 'processing' && ticket.status === "processing") {
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.PUNISH_TICKET.IS_PROCESSING, lang, null)], HttpStatus.NOT_FOUND);
                }
            }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    async getAllWaitingPunish() {
        try {
            const dateNow = new Date().toISOString();
            const query = {
                $and: [
                    { status: "waiting" },
                    { time_start: { $lte: dateNow } },
                    { is_delete: false }
                ]
            }
            const getPunish = await this.punishTicketRepositoryService.getListDataByCondition(query);

            return getPunish;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async RunDonePunishTicket() {
        try {
            const dateNow = new Date().toISOString();
            const query = {
                $and: [
                    { status: "doing" },
                    { time_end: { $lte: dateNow } },
                    { is_delete: false }
                ]
            }
            const getPunish = await this.punishTicketRepositoryService.getListDataByCondition(query);

            const arrChangeStatus = []
            for (let i = 0; i < getPunish.length; i++) {
                arrChangeStatus.push(this.doingToDonePunishTicket('vi', getPunish[i]));
            }
            const result = Promise.all(arrChangeStatus);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
