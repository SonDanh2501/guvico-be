import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ERROR, iPageDTO, previousBalanceCollaboratorDTO, queryWithinRangeDate, searchQuery } from 'src/@core';
import { createTransactionDTO, iPageTransactionDTOAdmin } from 'src/@core/dto/transaction.dto';
import { UserSystemDocument } from 'src/@repositories/module/mongodb/@database';
import { Transaction, TransactionDocument } from 'src/@repositories/module/mongodb/@database/schema/transaction.schema';
import { CollaboratorRepositoryService } from 'src/@repositories/repository-service/collaborator-repository/collaborator-repository.service';
import { CustomerRepositoryService } from 'src/@repositories/repository-service/customer-repository/customer-repository.service';
import { HistoryActivityRepositoryService } from 'src/@repositories/repository-service/history-activity-repository/history-activity-repository.service';
import { TransactionRepositoryService } from 'src/@repositories/repository-service/transaction-repository/transaction-repository.service';
import { UserSystemRepositoryService } from 'src/@repositories/repository-service/user-system-repository/user-system-repository.service';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service';
import { ActivityAdminSystemService } from 'src/core-system/activity-admin-system/activity-admin-system.service';
import { ActivitySystemService } from 'src/core-system/activity-system/activity-system.service';
import { CollaboratorSystemService } from 'src/core-system/collaborator-system/collaborator-system.service';
import { TransactionSystemService } from 'src/core-system/transaction-system/transaction-system.service';
import { ObjectId } from 'bson'
import { ActivityCollaboratorSystemService } from 'src/core-system/activity-collaborator-system/activity-collaborator-system.service';
@Injectable()
export class TransactionManagerService {
    constructor(
        private generalHandleService: GeneralHandleService,
        private transactionRepositoryService: TransactionRepositoryService,
        private customerRepositoryService: CustomerRepositoryService,
        private collaboratorRepositoryService: CollaboratorRepositoryService,
        private customExceptionService: CustomExceptionService,
        private transactionSystemService: TransactionSystemService,
        private activityAdminSystemService: ActivityAdminSystemService,
        private activitySystemService: ActivitySystemService,
        private activityCollaboratorSystemService: ActivityCollaboratorSystemService,
        private userSystemRepositoryService: UserSystemRepositoryService,
        private collaboratorSystemService: CollaboratorSystemService,
        private historyActivityRepositoryService: HistoryActivityRepositoryService,


    ) { }

    async getListItem(lang, iPage: iPageTransactionDTOAdmin) {
        try {
            const query: any = searchQuery(["transfer_note", "id_collaborator.full_name", "id_customer.full_name",
                'id_admin_action.full_name', "id_admin_action.full_name", "id_view", "id_collaborator.phone", "id_customer.phone"
            ], iPage)
            if (iPage.subject && iPage.subject !== "") {
                query.$and.push({ subject: iPage.subject });
            }
            if (iPage.kind_transfer && iPage.kind_transfer !== "") {
                query.$and.push({ kind_transfer: iPage.kind_transfer });
            }
            if (iPage.status && iPage.status !== "") {
                query.$and.push({ status: iPage.status });
            }
            if (iPage.type_transfer && iPage.type_transfer !== "") {
                query.$and.push({ type_transfer: iPage.type_transfer });
            }
            if (iPage.type_bank && iPage.type_bank !== "") {
                query.$and.push({ type_bank: iPage.type_bank });
            }
            if (iPage.payment_out && iPage.payment_out !== "") {
                query.$and.push({ payment_out: iPage.payment_out });
            }
            if (iPage.payment_in && iPage.payment_in !== "") {
                query.$and.push({ payment_in: iPage.payment_in });
            }
            if (iPage.start_date && iPage.end_date) {
                // query.$and.push(
                //     queryWithinRangeDate("date_create", iPage.start_date, iPage.end_date)
                // );
                query.$and.push({
                    $and: [
                        { date_create: { $lte: iPage.end_date } },
                        { date_create: { $gte: iPage.start_date } }
                    ]
                })
            }
            query.$and.push({
                type_transfer: { $in: ['top_up', 'withdraw'] }
            });
            const result = await this.transactionRepositoryService.getListPaginationDataByCondition(iPage, query, {}, { date_create: -1 }, [
                { path: "id_collaborator", select: { full_name: 1, phone: 1, _id: 1, } },
                { path: "id_customer", select: { full_name: 1, phone: 1, _id: 1, } },
                { path: "id_admin_verify", select: { full_name: 1, _id: 1, } },
                { path: "id_admin_action", select: { full_name: 1, _id: 1, } },
            ]);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async createItem(lang, payload: createTransactionDTO, admin: UserSystemDocument) {
        try {
            if (payload.money <= 0) throw new HttpException([await this.customExceptionService.i18nError(ERROR.TRANSACTION.GREATER_ZERO, lang, 'money')], HttpStatus.FORBIDDEN);
            await this.transactionSystemService.validatePayloadCreateTransaction(payload, lang);
            let _transfer_note = payload.transfer_note ? payload.transfer_note : '';
            let _kind_transfer = payload.kind_transfer;
            let collaborator;
            let customer;
            if (payload.subject === 'customer') {
                customer = await this.customerRepositoryService.findOneById(payload.id_customer);
                if (!customer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, 'customer')], HttpStatus.NOT_FOUND);
                if (payload.type_transfer === 'withdraw' && customer.pay_point < payload.money) {
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.CUSTOMER.NOT_ENOUGH_CASH, lang, 'customer')], HttpStatus.FORBIDDEN);
                }
                if (_transfer_note === '') {
                    _transfer_note = await this.transactionSystemService.generateRandomTransferNoteCustomer(customer)
                }
                payload.payment_out = payload.payment_out ? payload.payment_out : 'pay_point';
            } else if (payload.subject === 'collaborator') {
                collaborator = await this.collaboratorRepositoryService.findOneById(payload.id_collaborator);
                if (!collaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, 'collaborator')], HttpStatus.NOT_FOUND);
                if ((payload.type_transfer === 'withdraw') && payload.payment_out === 'collaborator_wallet' && collaborator.collaborator_wallet < payload.money || (payload.type_transfer === 'withdraw') && payload.payment_out === 'work_wallet' && collaborator.work_wallet < payload.money) {
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.ADMIN_COLLABORATOR_NOT_ENOUGH_REMAINDER, lang, 'collaborator')], HttpStatus.FORBIDDEN);
                }
                if ((payload.type_transfer === 'change') && payload.payment_out === 'collaborator_wallet' && payload.money > collaborator.collaborator_wallet || (payload.type_transfer === 'change') && payload.payment_out === 'work_wallet' && payload.money > collaborator.work_wallet) {
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.ADMIN_COLLABORATOR_NOT_ENOUGH_REMAINDER, lang, 'collaborator')], HttpStatus.FORBIDDEN);
                }
                if (_transfer_note === '') {
                    _transfer_note = await this.transactionSystemService.generateRandomTransferNoteCollaborator(collaborator);
                }
            }

            const dataCreate: createTransactionDTO = {
                id_collaborator: payload.subject === 'collaborator' ? payload.id_collaborator : null,
                id_customer: payload.subject === 'customer' ? payload.id_customer : null,
                id_admin_action: admin._id,
                money: payload.money,
                subject: payload.subject,
                title: payload.title,
                id_order: payload.id_order,
                transfer_note: _transfer_note,
                kind_transfer: _kind_transfer,
                type_transfer: payload.type_transfer,
                id_cash_book: payload.id_cash_book,
                payment_out: payload.payment_out,
                payment_in: payload.payment_in,
                // payment_method: payload.payment_method,
                type_wallet: payload.type_wallet,
            }
            let result: TransactionDocument = await this.transactionSystemService.createItem(dataCreate)
            this.activitySystemService.createTransaction(result);
            if (payload.subject === 'collaborator') {
                if (payload.type_transfer === 'withdraw') {
                    const previousCollaborator = {
                        work_wallet: collaborator.work_wallet,
                        collaborator_wallet: collaborator.collaborator_wallet
                    }
                    const resultHolding = await this.transactionSystemService.holdingMoney(lang, result._id); // tạm giữ
                    await this.activitySystemService.holdingMoney(resultHolding.collaborator, resultHolding.transaction, previousCollaborator) // log lịch sử
                    result = resultHolding.transaction
                } else if (payload.type_transfer === 'change') {
                    // await this.collaboratorSystemService.changeMoneyWallet(collaborator, payload.money);
                    // await this.activityAdminSystemService.adminChangeMoneyWallet(collaborator._id, result.money, admin._id);
                    // result.status = 'done';
                    // result.date_verify = new Date(Date.now()).toISOString();
                    // result.id_admin_verify = admin._id;
                    // result = await this.transactionRepositoryService.findByIdAndUpdate(result._id, result);
                    this.verifyItem(lang, admin, result._id);
                }
            } else if (payload.subject === 'customer') {
                // if (payload.type_transfer === 'top_up') {
                //     this.activityAdminSystemService.topUpCustomer(admin, customer, result);
                // } else if (payload.type_transfer === 'withdraw') {
                //     this.activityAdminSystemService.withdrawCustomer(admin, customer, result);
                // }
            } else if (payload.subject === 'other') {
                // if (payload.kind_transfer === 'income') {
                //     this.activityAdminSystemService.createTicketIncome(admin, result);
                // } else {
                //     this.activityAdminSystemService.createTicketExpense(admin, result);
                // }
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateItem(lang, id, payload) {
        try {
            const payload = {

            }
            const result = await this.transactionRepositoryService.findByIdAndUpdate(id, payload)
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    async deleteItem(lang, id, idAdmin) {
        try {
            const transaction = await this.transactionRepositoryService.findOneById(id);
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(transaction.id_collaborator);
            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, 'collaborator')], HttpStatus.NOT_FOUND);

            if (transaction === null) return true;
            if (transaction.id_collaborator !== null) {
                this.activityAdminSystemService.deleteTransCollaborator(idAdmin, transaction.id_collaborator, id, transaction.id_view);
            } else if (transaction.id_customer !== null) {
                this.activityAdminSystemService.deleteTransCustomer(idAdmin, transaction.id_customer, transaction)
            }

            if (transaction.status === 'holding') {
                const previousBalance = {
                    collaborator_wallet: getCollaborator.collaborator_wallet,
                    work_wallet: getCollaborator.work_wallet
                }
                await this.transactionSystemService.giveBackMoney(transaction, getCollaborator); // tạm giữ
                await this.activitySystemService.giveBackMoneyCollaborator(getCollaborator, transaction, previousBalance) // log lịch sử
            }

            const result = await this.transactionRepositoryService.findByIdAndSoftDelete(id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async detailItem(lang, idTransaction) {
        try {
            const transaction = await this.transactionRepositoryService.findOneById(idTransaction, {}, [
                { path: "id_collaborator", select: { full_name: 1, phone: 1, _id: 1, id_view: 1 } },
                { path: "id_customer", select: { full_name: 1, phone: 1, _id: 1, id_view: 1 } },
                { path: "id_admin_verify", select: { full_name: 1, _id: 1, } },
                { path: "id_admin_action", select: { full_name: 1, _id: 1, } },
                // { path: "id_order", select: { id_view: 1, _id: 1, } },
                // { path: "id_transaction", select: { id_view: 1, _id: 1, } },
            ]);
            if (!transaction) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, 'transaction')], HttpStatus.NOT_FOUND);
            return transaction;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async cancelItem(lang, id, admin: UserSystemDocument) {
        try {
            const result = await this.transactionSystemService.cancelTransaction(lang, id, admin);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async verifyItem(lang, admin: UserSystemDocument, id) {
        try {
            const getTransaction = await this.transactionRepositoryService.findOneById(id);
            await this.transactionSystemService.checkStatusTransaction(getTransaction, ['done', 'cancel'], lang)
            if (getTransaction.subject === 'collaborator') {
                const getCollaborator = await this.collaboratorRepositoryService.findOneById(getTransaction.id_collaborator);
                if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, 'collaborator')], HttpStatus.NOT_FOUND);
                const { collaborator, transaction } = await this.transactionSystemService.verifyTransaction(lang, getTransaction._id, admin);
                const previousBalance = {
                    collaborator_wallet: getCollaborator.collaborator_wallet,
                    work_wallet: getCollaborator.work_wallet,
                }
                if (transaction.type_transfer === 'top_up') {
                    await this.activitySystemService.verifyTopUpCollaborator(transaction, collaborator, previousBalance, admin);
                } else if (transaction.type_transfer === 'withdraw') {
                    await this.activitySystemService.verifyWithDrawCollaborator(transaction, collaborator, admin);
                } else if (transaction.type_transfer === 'change') {
                    this.activityCollaboratorSystemService.collaboratorChangeMoneyWallet(collaborator._id, Math.abs(getTransaction.money), previousBalance, transaction.payment_in)
                }
            } else if (getTransaction.subject === 'customer') {
                const { customer, transaction } = await this.transactionSystemService.verifyTransaction(lang, getTransaction._id, admin);
                if (transaction.type_transfer === 'top_up') {
                    await this.activitySystemService.verifyTopUpCustomer(transaction, customer, admin);
                } else if (transaction.type_transfer === 'withdraw') {
                    await this.activitySystemService.verifyWithdrawTransCustomer(transaction, customer, admin);
                }
            } else {
                // logic cần xử lý thêm nếu nó là phiếu thu chi của admin
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.NOT_SUPPORT_SERVICE, lang, 'collaborator')], HttpStatus.NOT_FOUND);
            }
            // const getCollaborator = getTransaction.id_collaborator && await this.collaboratorRepositoryService.findOneById(getTransaction.id_collaborator);
            // const previousBalance = getCollaborator && {
            //     collaborator_wallet: getCollaborator.collaborator_wallet,
            //     work_wallet: getCollaborator.work_wallet,
            // }
            // const { collaborator, customer, transaction } = await this.transactionSystemService.calculateTransaction(getTransaction);
            // // log lich su

            // if (transaction.subject === 'collaborator' && transaction.id_collaborator) {
            //     this.activitySystemService.verifyTransaction(transaction, previousBalance);
            //     this.collaboratorSystemService.balanceMoney(lang, collaborator._id);
            // } else if (transaction.subject === 'customer' && transaction.id_customer) {
            //     switch (transaction.type_transfer) {
            //         case "top_up":
            //             this.activityAdminSystemService.verifyTopUpCustomer(admin._id, customer, transaction)
            //             break;
            //         case "withdraw":
            //             this.activityAdminSystemService.verifyWithdrawTransCustomer(admin, customer, transaction)
            //             break;
            //         case "punish":
            //             this.activityAdminSystemService.verifyPunishTransCustomer(admin, customer, transaction)

            //             break;
            //         case "reward":

            //             break;
            //         default:
            //             break;
            //     }
            // } else if (!transaction.id_collaborator && !transaction.id_customer) {
            // }
            // transaction.status = 'done';
            // transaction.id_admin_verify = admin._id;
            // transaction.date_verify = new Date(Date.now()).toISOString();
            // await this.transactionRepositoryService.findByIdAndUpdate(id, transaction);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async totalTransaction(lang, iPage: iPageTransactionDTOAdmin) {
        try {
            const result = {
                total: '',
                pending: 'pending',
                transferred: 'transferred',
                holding: 'holding',
                done: 'done',
                cancel: 'cancel',
            }
            let query;
            for (const key in result) {
                const query: any = {
                    $and: [
                        { is_delete: false }
                    ]
                }
                if (iPage.subject && iPage.subject !== "") {
                    query.$and.push({ subject: iPage.subject });
                }
                if (iPage.kind_transfer && iPage.kind_transfer !== "") {
                    query.$and.push({ kind_transfer: iPage.kind_transfer });
                }
                if (iPage.type_transfer && iPage.type_transfer !== "") {
                    query.$and.push({ type_transfer: iPage.type_transfer });
                }
                if (iPage.payment_out && iPage.payment_out !== "") {
                    query.$and.push({ payment_out: iPage.payment_out });
                }
                if (iPage.start_date && iPage.end_date) {
                    query.$and.push(
                        queryWithinRangeDate("date_create", iPage.start_date, iPage.end_date)
                    );
                }
                query.$and.push({ type_transfer: { $nin: ['punish', 'reward'] } })
                if (result[key] !== '') {
                    query.$and.push({ status: result[key] });
                }
                const total = await this.transactionRepositoryService.countDataByCondition(query);
                result[key] = total
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async totalTransactionCustomer(lang, iPage: iPageTransactionDTOAdmin) {
        try {
            const query: any = {
                $and: [
                    { is_delete: false },
                    { subject: 'customer' }
                ]
            }
            if (iPage.start_date && iPage.end_date) {
                query.$and.push(
                    queryWithinRangeDate("date_create", iPage.start_date, iPage.end_date)
                );
            }
            query.$and.push({ type_transfer: { $nin: ['punish', 'reward'] } })
            const total = await this.transactionRepositoryService.countDataByCondition(query);
            query.$and.push({
                status: 'pending',
            })
            const total_pending = await this.transactionRepositoryService.countDataByCondition(query);
            query.$and[query.$and.length - 1].status = 'done';
            const total_done = await this.transactionRepositoryService.countDataByCondition(query);
            query.$and[query.$and.length - 1].status = 'cancel';
            const total_cancel = await this.transactionRepositoryService.countDataByCondition(query);
            const result = {
                total: total,
                total_pending: total_pending,
                total_done: total_done,
                total_cancel: total_cancel
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async totalMoneyTransaction(lang, iPage: iPageTransactionDTOAdmin, key: string) {
        try {
            const query: any =
            {
                $match: {
                    $and: [
                        { is_delete: false },
                    ]
                }
            }
            if (iPage.subject) {
                query.$match.$and.push(
                    { subject: iPage.subject }
                );
            }
            if (iPage.start_date && iPage.end_date) {
                query.$match.$and.push(
                    queryWithinRangeDate("date_create", iPage.start_date, iPage.end_date)
                );
            }
            query.$match.$and.push({
                type_transfer: key,
            })
            query.$match.$and.push({
                status: 'done',
            })
            const group = {
                $group: {
                    _id: {},
                    total: { $sum: "$money" },
                }
            }

            const total = await this.transactionRepositoryService.aggregateQuery([query, group]);
            const result = {
                total: total.length > 0 ? total[0].total : 0,
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async totalTransactionStaff(lang, iPage: iPageTransactionDTOAdmin) {
        try {
            const query: any = {
                $and: [
                    { is_delete: false },
                    { subject: 'other' }
                ]
            }
            if (iPage.start_date && iPage.end_date) {
                query.$and.push(
                    queryWithinRangeDate("date_create", iPage.start_date, iPage.end_date)
                );
            }
            const total = await this.transactionRepositoryService.countDataByCondition(query);
            query.$and.push({
                status: 'pending',
            })
            const total_pending = await this.transactionRepositoryService.countDataByCondition(query);
            query.$and[query.$and.length - 1].status = 'done';
            const total_done = await this.transactionRepositoryService.countDataByCondition(query);
            query.$and[query.$and.length - 1].status = 'cancel';
            const total_cancel = await this.transactionRepositoryService.countDataByCondition(query);
            const result = {
                total: total,
                total_pending: total_pending,
                total_done: total_done,
                total_cancel: total_cancel
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getActivityHistoryTransaction(lang, iPage: iPageDTO, idTransaction: string) {
        try {
            const query = {
                $and: [
                    { "id_transaction._id": new ObjectId(idTransaction) },
                ]
            }
            const getHistory = await this.historyActivityRepositoryService.getListPaginationDataByCondition(iPage, query, {}, { date_create: -1 },
                [
                    { path: "id_transaction", select: { title: 1, _id: 1, id_view: 1 } },
                    { path: "id_collaborator", select: { full_name: 1, _id: 1, phone: 1 } },
                    { path: "id_admin_action", select: { full_name: 1, _id: 1, email: 1 } },
                ]
            );
            return getHistory;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    // async changeWalletMoney(lang,payload){
    //     try {
    //         const collaborator = await this.collaboratorRepositoryService.findOneById(payload.id_collaborator);
    //         if (!collaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, 'collaborator')], HttpStatus.NOT_FOUND);
    //         await this.collaboratorSystemService.changeMoneyWallet(collaborator,payload.money);
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    //     }
    // }
}
