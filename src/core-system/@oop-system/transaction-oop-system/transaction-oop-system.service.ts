import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { ERROR, searchQuery } from 'src/@core'
import { createTransactionDTO, iPageTransactionDTOAdmin } from 'src/@core/dto/transaction.dto'
import { CustomerDocument } from 'src/@repositories/module/mongodb/@database'
import { KIND_TRANSFER, STATUS_TRANSACTION, TYPE_TRANSFER } from 'src/@repositories/module/mongodb/@database/enum'
import { TYPE_SUBJECT_ACTION } from 'src/@repositories/module/mongodb/@database/enum/base.enum'
import { TransactionRepositoryService } from 'src/@repositories/repository-service/transaction-repository/transaction-repository.service'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service'
@Injectable()
export class TransactionOopSystemService {
    constructor(
        private customExceptionService: CustomExceptionService,
        private transactionRepositoryService: TransactionRepositoryService,
        private generalHandleService: GeneralHandleService,
    ) { }

    async getDetailItem(lang, idItem) {
        try {
            const item = await this.transactionRepositoryService.findOneById(idItem);
            if (!item) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "transaction")], HttpStatus.NOT_FOUND)
            return item;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getDetailItemByTransferNote(lang, transfer_note) {
        try {
            const query = {
                transfer_note:transfer_note
            }
            const item = await this.transactionRepositoryService.findOne(query);
            if (!item) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "transaction")], HttpStatus.NOT_FOUND)
            return item;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    async getDetailItemByIdGroupOrder(lang, idGroupOrder) {
        try {
            const query = {
                $and: [
                    { id_group_order: idGroupOrder }
                ]
            }
            return await this.transactionRepositoryService.findOne(query);
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    async createItem(payload) {
        try {
            const _id_view = await this.generateRandomIdViewTransaction();
            const newPayload: createTransactionDTO = {
                id_view: _id_view,
                id_customer: payload.id_customer,
                id_collaborator: payload.id_collaborator,
                id_admin_action: payload.id_admin_action,
                id_order: payload.id_order,
                // id_reason_punish: payload.id_reason_punish,
                id_cash_book: payload.id_cash_book || null,
                date_create: new Date(Date.now()).toISOString(),
                bank_transfer: payload.bank_transfer,
                kind_transfer: payload.kind_transfer || KIND_TRANSFER.income,
                subject: payload.subject,
                money: payload.money || 0,
                viettel_money_transfer: null,
                momo_transfer: null,
                vnpay_transfer: null,
                type_transfer: payload.type_transfer,
                transfer_note: payload.transfer_note || null,
                status: payload.status ? payload.status : "pending",
                payment_out: payload.payment_out,
                payment_in: payload.payment_in,
                id_group_order: payload.id_group_order,
                // payment_method: payload.payment_method,
                type_wallet: payload.type_wallet,
            }
            const newItem = await this.transactionRepositoryService.create(newPayload);
            return newItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    async getList(lang, iPage: iPageTransactionDTOAdmin) {
        try {
            const query: any = searchQuery(["transfer_note", "id_collaborator.full_name", "id_customer.full_name",
                'id_admin_action.full_name', "id_admin_action.full_name", "id_view", "id_collaborator.phone", "id_customer.phone"
            ], iPage)
            const iPageTransactionDTOAdminKeys = ['type_bank', 'status', 'kind_transfer', 'type_transfer', 
                'subject','start_date', 'end_date', 'payment_out', 'payment_in'];
            const iPagaDTOKeys = Object.keys(iPage)
            let filkey = iPageTransactionDTOAdminKeys.filter(key => iPagaDTOKeys.includes(key));
            for(const itemKey of filkey) {
                if(iPage[itemKey] !== "" && itemKey !== "start_date" && itemKey !== "end_date") {
                    query.$and.push({ [itemKey]: iPage[itemKey]  })
                }
            }
            if (iPage.start_date && iPage.end_date && iPage.type_date) {
                const date_field = iPage.type_date === "date_create" ? "date_create" : "date_verify"
                query.$and.push({
                    $and: [
                        { [date_field]: { $lte: iPage.end_date } },
                        { [date_field]: { $gte: iPage.start_date } }
                    ]
                })
            }
            query.$and.push({
                type_transfer: { $in: ['top_up', 'withdraw', 'order_payment'] }
            });
            const sortOption = { date_create: -1 }
            const populateArray = 
            [ 
                { path: "id_collaborator", select: { full_name: 1, phone: 1, _id: 1, bank_name: 1 } },
                { path: "id_customer", select: { full_name: 1, phone: 1, _id: 1, } },
                { path: "id_admin_verify", select: { full_name: 1, _id: 1, } },
                { path: "id_admin_action", select: { full_name: 1, _id: 1, } },
            ]
            const dataResult = await this.transactionRepositoryService.getListPaginationDataByCondition(iPage, query, {}, sortOption, populateArray)
            return dataResult;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getTotalTransaction (lang, iPage: iPageTransactionDTOAdmin) {
        try {
            const result = {
                total: '',
                processing: 'processing',
                pending: 'pending',
                transferred: 'transferred',
                holding: 'holding',
                done: 'done',
                cancel: 'cancel',
            }
            for (const key in result) {
                const query: any = searchQuery(["transfer_note", "id_collaborator.full_name", "id_customer.full_name",
                    'id_admin_action.full_name', "id_admin_action.full_name", "id_view", "id_collaborator.phone", "id_customer.phone"
                ], iPage)
                const iPageTransactionDTOAdminKeys = ['type_bank', 'status', 'kind_transfer', 'type_transfer', 
                    'subject','start_date', 'end_date', 'payment_out', 'payment_in'];
                const iPagaDTOKeys = Object.keys(iPage)
                let filkey = iPageTransactionDTOAdminKeys.filter(key => iPagaDTOKeys.includes(key));
                for(const itemKey of filkey) {
                    if(iPage[itemKey] !== "" && itemKey !== "start_date" && itemKey !== "end_date") {
                        query.$and.push({ [itemKey]: iPage[itemKey]  })
                    }
                }
                if (iPage.start_date && iPage.end_date) {
                    query.$and.push({
                        $and: [
                            { date_create: { $lte: iPage.end_date } },
                            { date_create: { $gte: iPage.start_date } }
                        ]
                    })
                }
                query.$and.push({
                    type_transfer: { $in: ['top_up', 'withdraw', 'order_payment'] }
                });
                if (result[key] !== '') {
                    query.$and.push({ status: result[key] });
                }
                const populateArray = 
                [ 
                    { path: "id_collaborator", select: { full_name: 1, phone: 1, _id: 1, bank_name: 1 } },
                    { path: "id_customer", select: { full_name: 1, phone: 1, _id: 1, } },
                    { path: "id_admin_verify", select: { full_name: 1, _id: 1, } },
                    { path: "id_admin_action", select: { full_name: 1, _id: 1, } },
                ]
                const total = await this.transactionRepositoryService.countDataByCondition(query, populateArray);
                result[key] = total
            }
        
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    // async createItem(payload: createTransactionDTO) {
    //     try {
    //         const _id_view = await this.generateRandomIdViewTransaction()
    //         let _kind_transfer = 'income'
    //         if (payload.type_transfer === 'withdraw' || payload.type_transfer === 'reward') {
    //             _kind_transfer = 'expense'
    //         }

    //         const dataCreate: createTransactionDTO = {
    //             id_customer: payload.id_customer,
    //             id_collaborator: payload.id_collaborator,
    //             id_admin_action: payload.id_admin_action,
    //             id_order: payload.id_order,
    //             id_reason_punish: payload.id_reason_punish,
    //             id_cash_book: payload.id_cash_book,
    //             id_view: _id_view,
    //             id_punish_ticket: payload.id_punish_ticket,
    //             date_create: new Date(Date.now()).toISOString(),
    //             bank_transfer: payload.bank_transfer,
    //             kind_transfer: _kind_transfer,
    //             momo_transfer: payload.momo_transfer,
    //             subject: payload.subject,
    //             money: payload.money,
    //             viettel_money_transfer: payload.viettel_money_transfer,
    //             type_transfer: payload.type_transfer,
    //             transfer_note: payload.transfer_note,
    //             vnpay_transfer: payload.vnpay_transfer,
    //             status: payload.status ? payload.status : "pending",
    //             payment_in: payload.payment_in,
    //             payment_out: payload.payment_out,
    //             id_group_order: payload.id_group_order,
    //             // payment_method: payload.payment_method,
    //             type_wallet: payload.type_wallet,
    //         }
    //         const newItem = await this.transactionRepositoryService.create(dataCreate);
    //         return newItem;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }
    async generateRandomTransferNoteCustomer(customer: CustomerDocument) {
        const timeZone = 7;
        const dateNow = new Date(Number(new Date(Date.now()).getTime()) + (timeZone * 60 * 60 * 1000));
        const getDate = dateNow.getUTCDate();
        const getMonth = dateNow.getUTCMonth();
        const getFullYear = dateNow.getUTCFullYear();
        let tempRandomID = await this.generalHandleService.GenerateRandomString(3);
        let transferNote = `${customer.id_view}${getDate}${getMonth}${getFullYear}${tempRandomID}`;
        let checkDupTrans = await this.transactionRepositoryService.findOne({ transfer_note: transferNote });
        while (checkDupTrans && checkDupTrans.transfer_note !== null) {
            let tempRandomID = await this.generalHandleService.GenerateRandomString(3)
            transferNote = `${customer.id_view}${getDate}${getMonth}${getFullYear}${tempRandomID}`;
            checkDupTrans = await this.transactionRepositoryService.findOne({ transfer_note: transferNote });
        }
        return transferNote;
    }
    async generateRandomIdViewTransaction() {
        try {
            const date = new Date(Date.now())
            const year = date.getFullYear()
            const month = date.getMonth() + 1 > 9 ? `${date.getMonth() + 1}` : `0${date.getMonth() + 1}`;
            const day = date.getDate() > 9 ? `${date.getDate()}` : `0${date.getDate()}`;
            const tempRandomID = await this.generalHandleService.GenerateRandomString(6);
            let _id_view = `#${year}${month}${day}${tempRandomID}`;
            let checkDupTrans = await this.transactionRepositoryService.findOne({ id_view: _id_view });
            while (checkDupTrans) {
                const tempRandomID = await this.generalHandleService.GenerateRandomString(6);
                _id_view = `#${year}${month}${day}${tempRandomID}`;
                checkDupTrans = await this.transactionRepositoryService.findOne({ id_view: _id_view });
            }
            return _id_view;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateTransaction(lang, transaction) {
        try {
            await this.getDetailItem(lang, transaction._id)
            return await this.transactionRepositoryService.findByIdAndUpdate(transaction._id, transaction)
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async deletePermanentlyTransaction(lang, idTransaction) {
        try {
            let getTransaction = await this.getDetailItem(lang, idTransaction)
            getTransaction = await this.transactionRepositoryService.findByIdAndPermanentlyDelete(idTransaction)

            return true
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getListForAffiliateProgram(lang, subjectAction, iPage: iPageTransactionDTOAdmin, id_customer?) {
        try {
            const query: any = searchQuery(["transfer_note", "id_customer.full_name", "id_view", "id_customer.phone"
            ], iPage)
            const iPageTransactionDTOAdminKeys = ['type_bank', 'status', 'kind_transfer', 'type_transfer', 
                'subject','start_date', 'end_date', 'payment_out', 'payment_in'];
            const iPagaDTOKeys = Object.keys(iPage)
            let filkey = iPageTransactionDTOAdminKeys.filter(key => iPagaDTOKeys.includes(key));
            for(const itemKey of filkey) {
                if(iPage[itemKey] !== "" && itemKey !== "start_date" && itemKey !== "end_date") {
                    query.$and.push({ [itemKey]: iPage[itemKey]  })
                }
            }
            if (iPage.start_date && iPage.end_date) {
                query.$and.push({
                    $and: [
                        { date_create: { $lte: iPage.end_date } },
                        { date_create: { $gte: iPage.start_date } }
                    ]
                })
            }
            query.$and.push({ type_transfer: 'withdraw_affiliate' });
            if(subjectAction.type === TYPE_SUBJECT_ACTION.customer || (id_customer !== null && id_customer !== undefined)) {
                const idCustomer = subjectAction.type === TYPE_SUBJECT_ACTION.customer ? subjectAction._id : await this.generalHandleService.convertObjectId(id_customer)
                query.$and.push({ id_customer: idCustomer});
            }
            const sortOption = { date_create: -1 }
            const populateArray = 
            [ 
                { path: "id_customer", select: { full_name: 1, phone: 1, _id: 1, } },
                { path: "id_admin_verify", select: { full_name: 1, _id: 1, } },
                { path: "id_admin_action", select: { full_name: 1, _id: 1, } },
            ]
            const result = await this.transactionRepositoryService.getListPaginationDataByCondition(iPage, query, {}, sortOption, populateArray);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getTotalForAffiliateProgram (lang, subjectAction, iPage: iPageTransactionDTOAdmin) {
        try {
            const result = {
                total: '',
                pending: 'pending',
                transferred: 'transferred',
                holding: 'holding',
                done: 'done',
                cancel: 'cancel',
            }
            for (const key in result) {
                const query: any = searchQuery(["transfer_note", "id_customer.full_name", "id_view", "id_customer.phone"
                ], iPage)
                const iPageTransactionDTOAdminKeys = ['type_bank', 'status', 'kind_transfer', 'type_transfer', 
                    'subject','start_date', 'end_date', 'payment_out', 'payment_in'];
                const iPagaDTOKeys = Object.keys(iPage)
                let filkey = iPageTransactionDTOAdminKeys.filter(key => iPagaDTOKeys.includes(key));
                for(const itemKey of filkey) {
                    if(iPage[itemKey] !== "" && itemKey !== "start_date" && itemKey !== "end_date") {
                        query.$and.push({ [itemKey]: iPage[itemKey]  })
                    }
                }
                if (iPage.start_date && iPage.end_date) {
                    query.$and.push({
                        $and: [
                            { date_create: { $lte: iPage.end_date } },
                            { date_create: { $gte: iPage.start_date } }
                        ]
                    })
                }
                query.$and.push({ type_transfer: 'withdraw_affiliate' });
                if(subjectAction.type === TYPE_SUBJECT_ACTION.customer) {
                    query.$and.push({ id_customer: subjectAction._id });
                }
                if (result[key] !== '') {
                    query.$and.push({ status: result[key] });
                }
                const populateArray = 
                [ 
                    { path: "id_customer", select: { full_name: 1, phone: 1, _id: 1, } },
                    { path: "id_admin_verify", select: { full_name: 1, _id: 1, } },
                    { path: "id_admin_action", select: { full_name: 1, _id: 1, } },
                ]
                const total = await this.transactionRepositoryService.countDataByCondition(query, populateArray);
                result[key] = total
            }
        
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    async getListIncomeTransactionForCollaboratorByTimeFrame(startTime, endTime) {
        try {
            const query = {
                $and: [
                    { status: STATUS_TRANSACTION.done },
                    { type_transfer:  TYPE_TRANSFER.top_up },
                    { id_collaborator: { $ne: null } },
                    { date_verify: { $gte: startTime, $lte: endTime } },
                    { is_delete: false }
                ]
            }

            return await this.transactionRepositoryService.getListDataByCondition(query, {}, { date_verify: 1 })
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getListExpensesTransactionForCollaboratorByTimeFrame(startTime, endTime) {
        try {
            const query = {
                $and: [
                    { status: STATUS_TRANSACTION.done },
                    { type_transfer:  TYPE_TRANSFER.withdraw },
                    { id_collaborator: { $ne: null } },
                    { date_verify: { $gte: startTime, $lte: endTime } },
                    { is_delete: false }
                ]
            }

            return await this.transactionRepositoryService.getListDataByCondition(query, {}, { date_verify: 1 })
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getListIncomeTransactionForCustomerByTimeFrame(startTime, endTime) {
        try {
            const query = {
                $and: [
                    { status: STATUS_TRANSACTION.done },
                    { type_transfer:  { $in: [TYPE_TRANSFER.top_up, TYPE_TRANSFER.order_payment] } },
                    { id_customer: { $ne: null } },
                    { date_verify: { $gte: startTime, $lte: endTime } },
                    { is_delete: false }
                ]
            }

            return await this.transactionRepositoryService.getListDataByCondition(query, {}, { date_verify: 1 })
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getListExpensesTransactionForCustomerByTimeFrame(startTime, endTime) {
        try {
            const query = {
                $and: [
                    { status: STATUS_TRANSACTION.done },
                    { type_transfer:  TYPE_TRANSFER.withdraw },
                    { id_customer: { $ne: null } },
                    { date_verify: { $gte: startTime, $lte: endTime } },
                    { is_delete: false }
                ]
            }

            return await this.transactionRepositoryService.getListDataByCondition(query, {}, { date_verify: 1 })
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}


