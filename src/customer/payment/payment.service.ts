import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer, CustomerDocument, ERROR, GlobalService, TransitionCustomer, TransitionCustomerDocument } from 'src/@core';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { CONFIG_VNPAY } from 'src/@share-module/vnpay/config';
import { VnpayService } from 'src/@share-module/vnpay/vnpay.service';
import { ActivityCustomerSystemService } from 'src/core-system/activity-customer-system/activity-customer-system.service';
import { CustomerSetting, CustomerSettingDocument } from '../../@core/db/schema/customer_setting.schema';
import { PaymentSystemService } from '../../core-system/payment-system/payment-system.service';
import { MomoService } from 'src/@share-module/momo/momo.service';
import { createPaymentMoMoDTO } from 'src/@share-module/momo/dto/momo.dto';
import { TransactionRepositoryService } from 'src/@repositories/repository-service/transaction-repository/transaction-repository.service';
import { TransactionSystemService } from 'src/core-system/transaction-system/transaction-system.service';
import { createTransactionDTO } from 'src/@core/dto/transaction.dto';
import { CustomerRepositoryService } from 'src/@repositories/repository-service/customer-repository/customer-repository.service';
import { ActivitySystemService } from 'src/core-system/activity-system/activity-system.service';
import { PAYMENT_ENUM, TYPE_TRANSFER, TYPE_WALLET } from 'src/@repositories/module/mongodb/@database/enum';

@Injectable()
export class PaymentService {
    constructor(
        private vnpayService: VnpayService,
        private globalService: GlobalService,
        private activityCustomerSystemService: ActivityCustomerSystemService,
        private activitySystemService: ActivitySystemService,
        private customExceptionService: CustomExceptionService,
        private paymentSystemService: PaymentSystemService,
        private momoService: MomoService,
        private transactionRepositoryService: TransactionRepositoryService,
        private transactionSystemService: TransactionSystemService,
        private customerRepositoryService: CustomerRepositoryService,
        @InjectModel(TransitionCustomer.name) private transitionCustomerModel: Model<TransitionCustomerDocument>,
        @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
        @InjectModel(CustomerSetting.name) private customerSettingModel: Model<CustomerSettingDocument>,

    ) { }



    async createVnpayPaymentUrl(lang, user, payload) {
        try {

            // throw new HttpException(err.response || [{ message: err.toString(), field: null }], HttpStatus.INTERNAL_SERVER_ERROR);
            // throw new HttpException([await this.customExceptionService.i18nError(ERROR.PAYMENT_METHOD_MAIN_TAIN, lang, null)], HttpStatus.NOT_FOUND);
            const timeZone = (payload.query.time_zone) ? payload.query.time_zone : 7;
            const dateNow = new Date(Number(new Date(Date.now()).getTime()) + (timeZone * 60 * 60 * 1000));
            const getDate = dateNow.getUTCDate();
            const getMonth = dateNow.getUTCMonth();
            const getFullYear = dateNow.getUTCFullYear();
            let tempRandomID = await this.globalService.randomID(3);
            let transferNote = `${user.id_view}${getDate}${getMonth}${getFullYear}${tempRandomID}`;
            let checkDupTrans = await this.transactionRepositoryService.findOne({ id_view: transferNote });
            while (checkDupTrans) {
                let tempRandomID = await this.globalService.randomID(3)
                transferNote = `${user.id_view}${getDate}${getMonth}${getFullYear}${tempRandomID}`;
                checkDupTrans = await this.transactionRepositoryService.findOne({ id_view: transferNote });
            }
            payload.query["orderDescription"] = transferNote;
            payload.query["orderType"] = 78;
            payload.query["returnUrl"] = CONFIG_VNPAY.vnp_ReturnUrl_Customer;
            // payload.query["bankCode"] = (payload.query["bankCode"] === "VNPAYQR" || payload.query["bankCode"] === "VNBANK") ?
            //     payload.query["bankCode"] : null;
            payload.query["bankCode"] = payload.query["bankCode"] || null;
            const result = await this.vnpayService.createPaymentUrl(lang, payload);
            const dataCreate: createTransactionDTO = {
                id_customer: user._id,
                money: payload.query.amount,
                subject: 'customer',
                transfer_note: payload.query["orderDescription"],
                type_transfer: TYPE_TRANSFER.top_up,
                payment_in: PAYMENT_ENUM.vnpay,
                payment_out: PAYMENT_ENUM.vnpay,
                vnpay_transfer: result,
                type_wallet: PAYMENT_ENUM.pay_point
            }
            const newTransaction = await this.transactionSystemService.createItem(dataCreate)
            await this.activitySystemService.createTransaction(newTransaction);
            return result.vnpUrl;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async vnpayReturn(lang, payload) {
        try {
            // const response = await this.vnpayIPN(lang, payload);
            const responseCode = payload.query['vnp_ResponseCode'];
            // if(responseCode === "00" && response.RspCode === "00") return "success";
            // else if(responseCode === "00" && response.RspCode === "02") return 'already_success';
            // else return 'error';


            if(responseCode === "00" ) { 
                // const timeout = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
                // setTimeout(() => {
                //     this.vnpayIPN(lang, payload);
                // }, timeout);
                return "success"; }
            else return 'error';

        } catch (err) {
            return 'error';
            // throw new HttpException(err.response || [{ message: err.toString(), field: null }], HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async vnpayIPN(lang, payload, ipAddr?) {
        try {
            const transaction = await this.transactionRepositoryService.findOne({ transfer_note: payload.query["vnp_OrderInfo"] });
            if (!transaction) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            }
            const response = await this.vnpayService.vnpayIpn(lang, payload);
            if (response.responseCode === "00") {
                if (transaction.money !== Number(payload.query["vnp_Amount"] / 100)) {
                    const result = {
                        Message: "Invalid amount",
                        RspCode: "04"
                    };
                    return result;
                }
                if (response.secureHash !== response.signed) {
                    const result = {
                        Message: "Invalid Checksum",
                        RspCode: "97"
                    };
                    return result;
                }
                if (transaction.vnpay_transfer.vnp_TxnRef !== payload.query["vnp_TxnRef"]) {
                    const result = {
                        Message: "Order Not Found",
                        RspCode: "01"
                    };
                    return result;
                }
                if (transaction.status === "done") {
                    const result = {
                        Message: "Order already confirmed",
                        RspCode: "02"
                    };
                    return result;
                }
                console.log('check IPN');

                const resultVerify = await this.transactionSystemService.verifyTransaction(lang, transaction)
                // const resultTransaction = await this.transactionRepositoryService.findByIdAndUpdate(transaction._id, transaction)
                // this.activityCustomerSystemService.customerSuccessTopUp(resultVerify.customer._id, transaction.money, resultTransaction);
                await this.activitySystemService.verifyTopUpCustomer(resultVerify.transaction, resultVerify.customer);
                const result = {
                    RspCode: '00',
                    Message: 'Confirm Success'
                }
                return result;
            } else if (response.responseCode === "99") {
                transaction.status = 'fail';
                await this.transactionRepositoryService.findByIdAndUpdate(transaction._id, transaction)
                const result = {
                    RspCode: '00',
                    Message: 'Confirm Success'
                }
                return result;
            }
            else {
                await this.transactionRepositoryService.findByIdAndUpdate(transaction._id, transaction)
                const result = {
                    Message: "Invalid Checksum",
                    RspCode: "97"
                };
                return result;
            }
        } catch (err) {
            const result = {
                RspCode: '99',
                Message: 'Unknow error'
            }
            return result;
        }
    }

    async getTransitionWithIdView(lang, user, idView) {
        try {
            const transaction = await this.transactionRepositoryService.findOne({ id_customer: user._id, transfer_note: idView });
            if (!transaction) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            return transaction;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async createMoMoPayment(lang, payload: createPaymentMoMoDTO, user: CustomerDocument) {
        try {
            // throw new HttpException([await this.customExceptionService.i18nError(ERROR.PAYMENT_METHOD_MAIN_TAIN, lang, null)], HttpStatus.NOT_FOUND);

            const _transfer_note = await this.transactionSystemService.generateRandomTransferNoteCustomer(user);
            const dataCreate: createTransactionDTO = {
                id_customer: user._id,
                money: payload.amount,
                subject: 'customer',
                transfer_note: _transfer_note,
                type_transfer: TYPE_TRANSFER.top_up,
                payment_in: PAYMENT_ENUM.momo,
                payment_out: PAYMENT_ENUM.momo,
                type_wallet: TYPE_WALLET.pay_point
            }
            const newTransaction = await this.transactionSystemService.createItem(dataCreate)
            this.activitySystemService.createTransaction(newTransaction);
            const isCustomer = true;
            const result = await this.momoService.createPaymentUrlV2(lang, payload, user, newTransaction, isCustomer);
            newTransaction.momo_transfer = result;
            await this.transactionRepositoryService.findByIdAndUpdate(newTransaction._id, newTransaction);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


}
