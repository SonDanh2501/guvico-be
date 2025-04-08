import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Customer, CustomerDocument, ERROR, HistoryActivity, HistoryActivityDocument, iPageDTO, Order, OrderDocument, TranferMoneyCustomerDTOCustomer } from 'src/@core'
import { TransitionCustomer, TransitionCustomerDocument } from 'src/@core/db/schema/transition_customer.schema'
import { GlobalService } from 'src/@core/service'
import { HistoryActivityRepositoryService } from 'src/@repositories/repository-service/history-activity-repository/history-activity-repository.service'
import { TransactionRepositoryService } from 'src/@repositories/repository-service/transaction-repository/transaction-repository.service'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
import { ActivityCustomerSystemService } from 'src/core-system/activity-customer-system/activity-customer-system.service'
import { TransactionSystemService } from 'src/core-system/transaction-system/transaction-system.service'

@Injectable()
export class FinanceService {
    constructor(
        private customExceptionService: CustomExceptionService,
        private globalService: GlobalService,
        private activityCustomerSystemService: ActivityCustomerSystemService,
        private transactionRepositoryService: TransactionRepositoryService,
        private transactionSystemService: TransactionSystemService,
        private historyActivityRepositoryService: HistoryActivityRepositoryService,

        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @InjectModel(TransitionCustomer.name) private transitionCustomerModel: Model<TransitionCustomerDocument>,
        @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
        @InjectModel(HistoryActivity.name) private historyActivityModel: Model<HistoryActivityDocument>,

    ) { }
    async topupAccount(lang, user, payload: TranferMoneyCustomerDTOCustomer) {
        try {
            // const randomID = await this.globalService.randomID(21)
            // for (const item of GUVI_BANKING_INFOR) {
            //     const newTransitionCollaborator = new this.transitionCustomerModel({
            //         id_collaborator: user._id,
            //         money: payload.money,
            //         is_verify_money: false,
            //         status: "pending",
            //         transfer_note: randomID,
            //         type_transfer: "top_up",
            //         guvi_bank_infor: {
            //             account_number: item.account_number,
            //             account_name: item.account_name,
            //             bank_name: item.bank_name,
            //             bank_full_name: item.bank_full_name,
            //             image: item.image,
            //         },
            //         payment_discount: 0
            //     })
            //     await newTransitionCollaborator.save();
            //     this.activityCustomerSystemService.requestTopUpPayPoint(user._id, newTransitionCollaborator._id, payload.money)
            //     return newTransitionCollaborator;
            // }

            // const payloadTransation = {
            //     id_customer: user._id,
            //     money: payload.money,
            //     status: "pending",
            //     transfer_note: randomID,
            //     type_transfer: "top_up",
            //     payment_discount: 0,
            // }
            // const newTransactionCollaborator = await this.transactionSystemService.createItem(payloadTransation);
            // this.activityCustomerSystemService.requestTopUpPayPoint(user._id, newTransactionCollaborator._id, payload.money)
            // return newTransactionCollaborator;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getDetailTransition(lang, user, id: string) {
        try {
            // const item = await this.transitionCustomerModel.findOne({ id_customer: user._id, _id: id })
            // if (!item) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            // return item;

            const item = await this.transactionRepositoryService.findOne({ id_customer: user._id, _id: id });
            if (!item) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            return item;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async transferedMoney(lang, id: string) {
        try {
            // const getItem = await this.transitionCustomerModel.findById(id)
            // if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "transition")], HttpStatus.NOT_FOUND);
            // getItem.status = "transfered"
            // await getItem.save()

            const getItem = await this.transactionRepositoryService.findOneById(id);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "transition")], HttpStatus.NOT_FOUND);
            getItem.status = "transfered";
            await this.transactionRepositoryService.findByIdAndUpdate(id, getItem);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    async cancelTransfer(lang, id: string) {
        try {
            // const getItem = await this.transitionCustomerModel.findById(id)
            // if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "transition")], HttpStatus.NOT_FOUND);
            // getItem.status = "cancel"
            // await getItem.save()
            // return true;

            const getItem = await this.transactionRepositoryService.findOneById(id);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "transaction")], HttpStatus.NOT_FOUND);
            getItem.status = 'cancel';
            await this.transactionRepositoryService.findByIdAndUpdate(id, getItem);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    async getHistoryTransfer(lang, iPage: iPageDTO, user) {
        try {
            const query = {
                $and: [
                    // {
                    //     $or: [{
                    //         name: {
                    //             $regex: iPage.search,
                    //             $options: "i"
                    //         },
                    //     },]
                    // },
                    {
                        $or: [
                            { type: "customer_success_top_up_pay_point" },
                            { type: "customer_payment_pay_point_service" },
                            { type: "customer_payment_point_service" },
                            { type: "customer_payment_momo_service" },
                            { type: "customer_payment_vnpay_service" },
                            { type: "customer_refund_pay_point" },
                            { type: "verify_top_up" },
                            { type: "verify_transaction_top_up" },
                            { type: "verify_transaction_withdraw" },
                            { type: "verify_transaction_refund_payment_service" },
                            { type: "verify_transaction_payment_service" },
                            { type: "customer_refund_money" },
                            { type: "system_give_pay_point_customer" }
                        ]
                    },
                    {
                        id_customer: user._id
                    },
                    {
                        is_delete: false
                    }
                ]
            }

            const arrItem = await this.historyActivityModel.find(query)
                .sort({ date_create: -1, _id: -1 })
                .populate({ path: 'id_transistion_customer', select: { status: 1, id_view: 1 } })
                .skip(iPage.start)
                .limit(iPage.length)
                .then();
            const count = await this.historyActivityModel.count(query)
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

    // Trả về 1 Transaction của KH
    async getDetailHistorActivity(lang, user, id: string) {
        try {
            // const item = await this.historyActivityModel.findById(id)
            //     .populate({ path: 'id_transistion_customer', select: { status: 1, id_view: 1, method_transfer: 1, type_transfer: 1 } })
            // if (!item) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            // return item;

            const activity = await this.historyActivityModel.findById(id);
            if (!activity) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            const transaction = await this.transactionRepositoryService.findOneById(activity.id_transaction);
            if (!transaction) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            return transaction;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
