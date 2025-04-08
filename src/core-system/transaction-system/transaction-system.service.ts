import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { ERROR, GlobalService } from 'src/@core'
import { createTransactionDTO } from 'src/@core/dto/transaction.dto'
import { CollaboratorDocument, CustomerDocument, UserSystemDocument } from 'src/@repositories/module/mongodb/@database'
import { TransactionDocument } from 'src/@repositories/module/mongodb/@database/schema/transaction.schema'
import { CollaboratorRepositoryService } from 'src/@repositories/repository-service/collaborator-repository/collaborator-repository.service'
import { CustomerRepositoryService } from 'src/@repositories/repository-service/customer-repository/customer-repository.service'
import { TransactionRepositoryService } from 'src/@repositories/repository-service/transaction-repository/transaction-repository.service'
import { UserSystemRepositoryService } from 'src/@repositories/repository-service/user-system-repository/user-system-repository.service'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
import { ActivityAdminSystemService } from '../activity-admin-system/activity-admin-system.service'
import { ActivitySystemService } from '../activity-system/activity-system.service'
import { CollaboratorSystemService } from '../collaborator-system/collaborator-system.service'

@Injectable()
export class TransactionSystemService {
    constructor(
        private transactionRepositoryService: TransactionRepositoryService,
        private collaboratorRepositoryService: CollaboratorRepositoryService,
        private customerRepositoryService: CustomerRepositoryService,
        private globalService: GlobalService,
        private customExceptionService: CustomExceptionService,
        private activitySystemService: ActivitySystemService,
        private activityAdminSystemService: ActivityAdminSystemService,
        private userSystemRepositoryService: UserSystemRepositoryService,
        private collaboratorSystemService: CollaboratorSystemService,
    ) { }

    /**
     * 
     * @param payload các tham số cần thiết để tạo nên transaction
     * @note chỉ đơn thuần tạo ra record transaction không bắn thông báo cũng ko lưu log lịch sử
     */
    async createItem(payload: createTransactionDTO) {
        try {
            const _id_view = await this.generateRandomIdViewTransaction()
            let _kind_transfer = 'income'
            if (payload.type_transfer === 'withdraw' || payload.type_transfer === 'reward') {
                _kind_transfer = 'expense'
            }

            const dataCreate: createTransactionDTO = {
                id_customer: payload.id_customer,
                id_collaborator: payload.id_collaborator,
                id_admin_action: payload.id_admin_action,
                id_order: payload.id_order,
                id_reason_punish: payload.id_reason_punish,
                id_cash_book: payload.id_cash_book,
                id_view: _id_view,
                id_punish_ticket: payload.id_punish_ticket,
                date_create: new Date(Date.now()).toISOString(),
                bank_transfer: payload.bank_transfer,
                kind_transfer: _kind_transfer,
                momo_transfer: payload.momo_transfer,
                subject: payload.subject,
                money: payload.money,
                viettel_money_transfer: payload.viettel_money_transfer,
                type_transfer: payload.type_transfer,
                transfer_note: payload.transfer_note,
                vnpay_transfer: payload.vnpay_transfer,
                status: payload.status ? payload.status : "pending",
                payment_in: payload.payment_in,
                payment_out: payload.payment_out,
                id_group_order: payload.id_group_order,
                // payment_method: payload.payment_method,
                type_wallet: payload.type_wallet,
            }
            const newItem = await this.transactionRepositoryService.create(dataCreate);
            return newItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async generateRandomTransferNoteCollaborator(collaborator: CollaboratorDocument) {
        let tempRandomID = await this.globalService.randomIDTransition(4)
        let randomID = `${collaborator.phone}${tempRandomID}`
        let checkRandomID = await this.transactionRepositoryService.findOne({ transfer_note: randomID });
        while (checkRandomID && checkRandomID.transfer_note !== null) {
            tempRandomID = await this.globalService.randomIDTransition(4)
            randomID = `${collaborator.id_view}${tempRandomID}`
            checkRandomID = await this.transactionRepositoryService.findOne({ transfer_note: randomID });
        }
        return collaborator.phone + tempRandomID;
    }

    async generateRandomTransferNoteCustomer(customer: CustomerDocument) {
        const timeZone = 7;
        const dateNow = new Date(Number(new Date(Date.now()).getTime()) + (timeZone * 60 * 60 * 1000));
        const getDate = dateNow.getUTCDate();
        const getMonth = dateNow.getUTCMonth();
        const getFullYear = dateNow.getUTCFullYear();
        let tempRandomID = await this.globalService.randomID(3);
        let transferNote = `${customer.id_view}${getDate}${getMonth}${getFullYear}${tempRandomID}`;
        let checkDupTrans = await this.transactionRepositoryService.findOne({ transfer_note: transferNote });
        while (checkDupTrans && checkDupTrans.transfer_note !== null) {
            let tempRandomID = await this.globalService.randomID(3)
            transferNote = `${customer.id_view}${getDate}${getMonth}${getFullYear}${tempRandomID}`;
            checkDupTrans = await this.transactionRepositoryService.findOne({ transfer_note: transferNote });
        }
        return transferNote;
    }

    async generateRandomIdOrderTransaction() {
        let tempRandomID = await this.globalService.randomIDTransition(16)
        let checkRandomID = await this.transactionRepositoryService.findOne({ id_order: tempRandomID });
        let a = 0;
        while (checkRandomID && a < 5) {
            tempRandomID = await this.globalService.randomIDTransition(16)
            checkRandomID = await this.transactionRepositoryService.findOne({ id_order: tempRandomID });
            a += 1;
        }
        return tempRandomID;
    }

    async validatePayloadCreateTransaction(payload: createTransactionDTO, lang): Promise<Boolean> {
        if (payload.subject === 'customer' && !payload.id_customer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, 'customer')], HttpStatus.NOT_FOUND);
        if (payload.subject === 'collaborator' && !payload.id_collaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, 'collaborator')], HttpStatus.NOT_FOUND);
        return true;
    }
    /**
 * 
 * @param transaction lệnh giao dịch cần kiểm tra (nếu truyền vào là null hay undefine thì báo lỗi ko tồn tại) 
 * @param status các trạng thái cần kiểm tra
 * @param lang ngôn ngữ trả lỗi
 * @returns kiểm tra trạng thái đơn hàng với các status cần kiểm tra, trả lỗi nếu trạng thái của giao dich
 * trùng với 1 trong các trạng thái truyền vào 
 */
    async checkStatusTransaction(transaction: TransactionDocument, status: string[], lang) {
        try {
            if (!transaction) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, 'transaction')], HttpStatus.BAD_REQUEST);
            for (let i of status) {
                if (i === 'cancel' && transaction.status === "cancel") {
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.TRANSITION_CANCEL, lang, null)], HttpStatus.FORBIDDEN);
                }
                if (i === 'transferred' && transaction.status === "transferred") {
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.TRANSITION_CANCEL, lang, null)], HttpStatus.FORBIDDEN);
                }
                if (i === 'holding' && transaction.status === "holding") {
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.TRANSITION_CANCEL, lang, null)], HttpStatus.FORBIDDEN);
                }
                if (i === 'done' && transaction.status === "done") {
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.TRANSITION_DONE, lang, null)], HttpStatus.FORBIDDEN);
                }

            }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async holdingMoneyCollaborator(transaction: TransactionDocument, collaborator: CollaboratorDocument): Promise<boolean> {
        if (transaction.payment_in === 'work_wallet') {
            collaborator.work_wallet -= transaction.money;
        } else {
            collaborator.collaborator_wallet -= transaction.money;
        }
        return true;
    }

    /**
     * 
     * @param transaction lệnh giao dịch
     * @param collaborator cộng tác viên
     * @returns giá trị mới của ctv sau khi đã được cộng tiền
     */
    async giveBackMoney(transaction: TransactionDocument, collaborator: CollaboratorDocument) {
        if (transaction.payment_out === 'work_wallet') {
            collaborator.work_wallet += transaction.money;
        } else {
            console.log("give money back");
            collaborator.collaborator_wallet += transaction.money;
        }
        const returnCollaborator = await this.collaboratorRepositoryService.findByIdAndUpdate(collaborator._id, collaborator);
        return returnCollaborator;
    }


    /**
* 
* @param transaction giao dịch cần thực hiện
* @param lang ngôn ngữ trả lỗi
* @returns true Chay lenh giao dich thu/chi tuong ung trong he thong
*/
    async calculateTransaction(transaction: TransactionDocument, isPunishTicket: boolean = false) {
        try {
            let collaborator;
            let customer;
            if (transaction.id_collaborator) {
                collaborator = await this.collaboratorRepositoryService.findOneById(transaction.id_collaborator.toString());
                switch (transaction.type_transfer) {
                    case "top_up": {
                        if (transaction.type_wallet === "collaborator_wallet") collaborator.collaborator_wallet += transaction.money
                        if (transaction.type_wallet === "work_wallet") collaborator.work_wallet += transaction.money
                        break;
                    }
                    case "reward": {
                        break;
                    }
                    case "withdraw": {
                        // if(transaction.payment_out === "collaborator_wallet") collaborator.collaborator_wallet -= transaction.money
                        // if(transaction.payment_out === "work_wallet") collaborator.work_wallet -= transaction.money
                        break;
                    }
                    case "punish": {
                        if (transaction.payment_out === "collaborator_wallet") collaborator.collaborator_wallet -= transaction.money
                        if (transaction.payment_out === "work_wallet") collaborator.work_wallet -= transaction.money
                        break;
                    }
                    case 'change': {
                        if (transaction.payment_out === "collaborator_wallet") {
                            collaborator.collaborator_wallet -= transaction.money
                            collaborator.work_wallet += transaction.money
                        } else if (transaction.payment_out === "work_wallet") {
                            collaborator.work_wallet -= transaction.money
                            collaborator.collaborator_wallet += transaction.money
                        }
                    }
                    default: break;
                }
                // await collaborator.save();
                collaborator = await this.collaboratorRepositoryService.findByIdAndUpdate(collaborator._id, collaborator)
                await this.collaboratorSystemService.balanceMoney('vi', collaborator._id, isPunishTicket);

            } else if (transaction.id_customer) {
                customer = await this.customerRepositoryService.findOneById(transaction.id_customer.toString());
                switch (transaction.type_transfer) {
                    case "top_up": {
                        customer.pay_point += transaction.money
                        break;
                    }
                    case "refund_service": {
                        customer.pay_point += transaction.money
                        break;
                    }
                    case "pay_service":
                    case "withdraw": {
                        customer.pay_point -= transaction.money
                        break;
                    }

                    default: break;
                }
                customer = await this.customerRepositoryService.findByIdAndUpdate(customer._id, customer)
                // await customer.save();
            } else if (transaction.id_customer === null && transaction.id_collaborator === null) {
                switch (transaction.type_transfer) {
                    case "other": {
                        break;
                    }
                    default: break;
                }
            }
            // const resultTransaction = await this.transactionRepositoryService.findByIdAndUpdate(transaction._id, transaction);

            return {
                transaction: transaction,
                customer: customer,
                collaborator: collaborator
            };
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 
     * @param lang 
     * @param idTransaction id transaction
     * @returns 
     * transaction giá trị transaction mới ---
     * customer giá trị customer mới ---
     * collector giá trị collector mới ---
     * @note Tất cả các giá trị trả về để đã được lưu lại trong database KHÔNG cần lưu lại thêm thông tin mới
     * @note Nơi đây không có lưu log, khi gọi nó ở đâu thì phải lưu log lại tại chỗ đó
     */
    async verifyTransaction(lang, idTransaction, admin?: UserSystemDocument, isPunishTicket: boolean = false) {
        try {
            const findTransaction = await this.transactionRepositoryService.findOneById(idTransaction);
            if (!findTransaction) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, 'id_transaction')], HttpStatus.NOT_FOUND);
            // let getObject;
            // let previousBalance = null;
            // if (findTransaction.id_collaborator !== null) {
            //     getObject = await this.collaboratorRepositoryService.findOneById(findTransaction.id_collaborator);
            //     previousBalance = {
            //         work_wallet: getObject.work_wallet,
            //         collaborator_wallet: getObject.collaborator_wallet
            //     }
            // }
            await this.checkStatusTransaction(findTransaction, ["done", 'cancel'], lang);
            const result = await this.calculateTransaction(findTransaction, isPunishTicket);
            findTransaction.status = 'done';
            findTransaction.date_verify = new Date(Date.now()).toISOString();
            if (admin) {
                findTransaction.id_admin_verify = admin._id;
            }

            result.transaction = await this.transactionRepositoryService.findByIdAndUpdate(findTransaction._id, findTransaction);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async holdingMoney(lang, idTransaction) {
        try {
            const getTransaction = await this.transactionRepositoryService.findOneById(idTransaction);
            if (!getTransaction) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, 'id_transaction')], HttpStatus.NOT_FOUND);
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(getTransaction.id_collaborator);
            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, 'id_transaction')], HttpStatus.NOT_FOUND);
            getTransaction.status = "holding";
            if (getTransaction.type_wallet === 'work_wallet') {
                getCollaborator.work_wallet -= getTransaction.money;
            } else {
                getCollaborator.collaborator_wallet -= getTransaction.money;
            }
            const collaborator = await this.collaboratorRepositoryService.findByIdAndUpdate(getCollaborator._id, getCollaborator);
            const transaction = await this.transactionRepositoryService.findByIdAndUpdate(idTransaction, getTransaction);
            return {
                collaborator: collaborator,
                transaction: transaction
            };
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    /**
     * 
     * @param lang ngôn ngữ
     * @param id id của transaction
     * @param admin admin thực hiện hành động
     * @returns 
     */
    async cancelTransaction(lang, id, admin?) {
        try {
            const transaction = await this.transactionRepositoryService.findOneById(id);
            await this.checkStatusTransaction(transaction, ['done', 'cancel'], lang)
            if (transaction.subject === 'customer') {
                this.activitySystemService.cancelTransaction(transaction, admin)
            } else if (transaction.subject === 'collaborator') {
                if (transaction.type_transfer === 'withdraw') {
                    const getCollaborator = await this.collaboratorRepositoryService.findOneById(transaction.id_collaborator);
                    if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, 'id_transaction')], HttpStatus.NOT_FOUND);

                    const previousCollaborator = {
                        collaborator_wallet: getCollaborator.collaborator_wallet,
                        work_wallet: getCollaborator.work_wallet
                    }
                    const collaborator = await this.giveBackMoney(transaction, getCollaborator);
                    await this.activitySystemService.giveBackMoneyCollaborator(collaborator, transaction, previousCollaborator);
                }
            }
            this.activitySystemService.cancelTransaction(transaction);
            transaction.status = 'cancel'
            await this.transactionRepositoryService.findByIdAndUpdate(id, transaction);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async generateRandomIdViewTransaction() {
        try {
            const date = new Date(Date.now())
            const year = date.getFullYear()
            const month = date.getMonth() + 1 > 9 ? `${date.getMonth() + 1}` : `0${date.getMonth() + 1}`;
            const day = date.getDate() > 9 ? `${date.getDate()}` : `0${date.getDate()}`;
            const tempRandomID = await this.globalService.randomIDTransition(6);
            let _id_view = `#${year}${month}${day}${tempRandomID}`;
            let checkDupTrans = await this.transactionRepositoryService.findOne({ id_view: _id_view });
            while (checkDupTrans) {
                const tempRandomID = await this.globalService.randomIDTransition(6);
                _id_view = `#${year}${month}${day}${tempRandomID}`;
                checkDupTrans = await this.transactionRepositoryService.findOne({ id_view: _id_view });
            }
            return _id_view;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}


