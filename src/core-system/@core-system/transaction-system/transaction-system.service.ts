import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { ERROR, MINIMUM_AMOUNT_TO_WITHDRAW } from 'src/@core/constant'
import { createTransactionDTO, iPageTransactionDTOAdmin } from 'src/@core/dto/transaction.dto'
import { PAYMENT_ENUM, STATUS_TRANSACTION, SUBJECT_ENUM, TYPE_TRANSFER, TYPE_WALLET } from 'src/@repositories/module/mongodb/@database/enum'
import { TYPE_SUBJECT_ACTION } from 'src/@repositories/module/mongodb/@database/enum/base.enum'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service'
import { CollaboratorOopSystemService } from 'src/core-system/@oop-system/collaborator-oop-system/collaborator-oop-system.service'
import { CustomerOopSystemService } from 'src/core-system/@oop-system/customer-oop-system/customer-oop-system.service'
import { HistoryActivityOopSystemService } from 'src/core-system/@oop-system/history-activity-oop-system/history-activity-oop-system.service'
import { TransactionOopSystemService } from 'src/core-system/@oop-system/transaction-oop-system/transaction-oop-system.service'
import { UserSystemOoopSystemService } from 'src/core-system/@oop-system/user-system-ooop-system/user-system-ooop-system.service'

@Injectable()
export class TransactionSystemService {
    constructor (
        private customExceptionService: CustomExceptionService,
        private generalHandleService: GeneralHandleService, 

        private transactionOopSystemService: TransactionOopSystemService,

        private customerOopSystemService: CustomerOopSystemService,
        private collaboratorOopSystemService: CollaboratorOopSystemService,
        private userSystemOoopSystemService: UserSystemOoopSystemService,
        private historyActivityOopSystemService: HistoryActivityOopSystemService,
    ) {}


    async getDetailItemByIdOrder(lang, idOrder) {
        try {
            return await this.transactionOopSystemService.getDetailItemByIdGroupOrder(lang, idOrder);
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async createTransaction(lang, subjectAction, user, payload) {
        try {
            const payloadDependency = {
                customer: null,
                collaborator: null,
                transaction: null,
                admin: null
            }
            if(subjectAction.type !== TYPE_SUBJECT_ACTION.admin) {
                payload.transfer_note = await this.transactionOopSystemService.generateRandomTransferNoteCustomer(user)
            }

            const newData = await this.transactionOopSystemService.createItem(payload);
            return newData;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getList(subjectAction, iPage) {
        try {
            // const getList = await this.transactionOopSystemService.getList(subjectAction, iPage)

        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async revokeTransaction(lang, subjectAction, idTransaction) {
        try {
            
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getListItem (lang, iPage: iPageTransactionDTOAdmin) {
        try {
            return await this.transactionOopSystemService.getList(lang, iPage);
        }
        catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getTotalTransaction (lang, iPage: iPageTransactionDTOAdmin) {
        try {
            return await this.transactionOopSystemService.getTotalTransaction(lang, iPage);
        }
        catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    async createWithdrawalRequestForReferrer(lang, subjectAction, payload, user) {
        try {
            const payloadDependency = {
                customer: null,
                transaction: null,
                admin_action: null
            }

            if(subjectAction.type === TYPE_SUBJECT_ACTION.admin) {
                const getUser = await this.userSystemOoopSystemService.getDetailItem(lang, subjectAction._id)
                payloadDependency.admin_action = getUser
            }

            const idCustomer = subjectAction.type === TYPE_SUBJECT_ACTION.customer ? subjectAction._id : payload?.id_customer
            const getCustomer = await this.customerOopSystemService.getDetailItem(lang, idCustomer)

            // Kiem tra so tien trong vi co lon hon hoac bang 500,000đ khong
            if(getCustomer.a_pay < MINIMUM_AMOUNT_TO_WITHDRAW) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.CUSTOMER.NOT_ENOUGH_A_PAY, lang, null)], HttpStatus.FORBIDDEN);
            }
            
            // Kiem tra so tien can rut co lon hon so tien trong vi hay khong
            if(getCustomer.a_pay < +payload.money) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.CUSTOMER.WITHDRAWAL_AMOUNT_GREATER_THAN, lang, null)], HttpStatus.FORBIDDEN);
            }

            const previousBalance = {
                a_pay: getCustomer.a_pay
            }

            // Tru tien trong vi a_pay
            payloadDependency.customer = await this.customerOopSystemService.minusOrRedeemToReferrerPerson(lang, getCustomer._id, payload.money)


            // Tao lenh rut tien
            const payloadCreate: createTransactionDTO = {
                id_customer: subjectAction.type === TYPE_SUBJECT_ACTION.customer ? subjectAction._id : payload.id_customer,
                id_admin_action: subjectAction.type === TYPE_SUBJECT_ACTION.admin ? subjectAction._id: null,
                money: payload.money,
                transfer_note: null,
                subject: subjectAction.type,
                type_transfer: TYPE_TRANSFER.withdraw_affiliate,
                payment_out: PAYMENT_ENUM.bank_guvi,
                payment_in: PAYMENT_ENUM.bank,
                type_wallet: TYPE_WALLET.a_pay,
                status: STATUS_TRANSACTION.pending
            }
            payloadDependency.transaction = await this.createTransaction(lang, subjectAction, user, payloadCreate);

            await this.historyActivityOopSystemService.createWithdrawalRequestForReferrer(subjectAction, payloadDependency, +payload.money, previousBalance)

            return true
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getListForAffiliateProgram(lang, subjectAction, iPage: iPageTransactionDTOAdmin, id_customer?) {
        try {
            return await this.transactionOopSystemService.getListForAffiliateProgram(lang, subjectAction, iPage, id_customer)
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getTotalForAffiliateProgram(lang, subjectAction, iPage: iPageTransactionDTOAdmin) {
        try {
            return await this.transactionOopSystemService.getTotalForAffiliateProgram(lang, subjectAction, iPage)
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async checkStatusTransaction(transaction, status: string[], lang) {
        try {
            if (!transaction) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, 'transaction')], HttpStatus.BAD_REQUEST);
            for (const i of status) {
                if (i === STATUS_TRANSACTION.cancel && transaction.status === STATUS_TRANSACTION.cancel) {
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.TRANSITION_CANCEL, lang, null)], HttpStatus.FORBIDDEN);
                }
                if (i === STATUS_TRANSACTION.transferred && transaction.status === STATUS_TRANSACTION.transferred) {
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.TRANSITION_CANCEL, lang, null)], HttpStatus.FORBIDDEN);
                }
                if (i === STATUS_TRANSACTION.holding && transaction.status === STATUS_TRANSACTION.holding) {
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.TRANSITION_CANCEL, lang, null)], HttpStatus.FORBIDDEN);
                }
                if (i === STATUS_TRANSACTION.done && transaction.status === STATUS_TRANSACTION.done) {
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.TRANSITION_DONE, lang, null)], HttpStatus.FORBIDDEN);
                }

            }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async cancelTransaction(lang, subjectAction, idTransaction) {
        try {
            const payloadDependency = {
                customer: null, 
                collaborator: null,
                admin_action: null,
                transaction:null
            }

            if(subjectAction.type === TYPE_SUBJECT_ACTION.admin) {
                const getUser = await this.userSystemOoopSystemService.getDetailItem(lang, subjectAction._id)
                payloadDependency.admin_action = getUser
            }

            const transaction = await this.transactionOopSystemService.getDetailItem(lang, idTransaction);
            payloadDependency.transaction = transaction
            await this.checkStatusTransaction(transaction, [STATUS_TRANSACTION.done, STATUS_TRANSACTION.cancel], lang)
            if (transaction.subject === SUBJECT_ENUM.customer) {
                const getCustomer = await this.customerOopSystemService.getDetailItem(lang, transaction.id_customer)
                if (transaction.type_transfer === TYPE_TRANSFER.withdraw_affiliate) {
                    const previousBalance = {
                        a_pay: getCustomer.a_pay
                    }

                    payloadDependency.customer = await this.customerOopSystemService.minusOrRedeemToReferrerPerson(lang, transaction.id_customer, transaction.money, false)

                    await this.historyActivityOopSystemService.cancelWithdrawalRequestForReferrer(subjectAction, payloadDependency, transaction.money, previousBalance)
                }
            } else if (transaction.subject === SUBJECT_ENUM.collaborator) {
                
            }

            transaction.status = STATUS_TRANSACTION.cancel
            await this.transactionOopSystemService.updateTransaction(lang, transaction);

            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async verifyTransaction(lang, subjectAction, idTransaction) {
        try {
            const payloadDependency = {
                admin_action: null,
                transaction: null
            }

            if(subjectAction.type === TYPE_SUBJECT_ACTION.admin) {
                const getUser = await this.userSystemOoopSystemService.getDetailItem(lang, subjectAction._id)
                payloadDependency.admin_action = getUser
            }

            const getTransaction = await this.transactionOopSystemService.getDetailItem(lang,idTransaction);
            await this.checkStatusTransaction(getTransaction, [STATUS_TRANSACTION.done, STATUS_TRANSACTION.cancel], lang);

            const result = await this.calculateTransaction(lang, getTransaction);

            getTransaction.status = STATUS_TRANSACTION.done
            getTransaction.date_verify = new Date(Date.now()).toISOString();
              if(subjectAction.type === TYPE_SUBJECT_ACTION.admin) {
                getTransaction.id_admin_verify = subjectAction._id;
            }

            result.transaction = await this.transactionOopSystemService.updateTransaction(lang, getTransaction);
            payloadDependency.transaction = result.transaction
            await this.historyActivityOopSystemService.verifyTransaction(subjectAction, payloadDependency)

            return result
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

        async calculateTransaction(lang, transaction) {
            try {
                let collaborator;
                let customer;
                if (transaction.id_collaborator) {
                    collaborator = await this.collaboratorOopSystemService.getDetailItem(lang, transaction.id_collaborator);
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
                    collaborator = await this.collaboratorOopSystemService.updateCollaborator(lang, collaborator)    
                } else if (transaction.id_customer) {
                    customer = await this.customerOopSystemService.getDetailItem(lang, transaction.id_customer);
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
                    customer = await this.customerOopSystemService.updateCustomer(lang, customer)
                } else if (transaction.id_customer === null && transaction.id_collaborator === null) {
                    switch (transaction.type_transfer) {
                        case "other": {
                            break;
                        }
                        default: break;
                    }
                }
    
                return {
                    transaction: transaction,
                    customer: customer,
                    collaborator: collaborator
                };
            } catch (err) {
                throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
}
