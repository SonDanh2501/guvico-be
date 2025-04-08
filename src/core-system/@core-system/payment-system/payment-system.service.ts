import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import { createTransactionDTO } from 'src/@core/dto/transaction.dto'
import { PAYMENT_ENUM, PAYMENT_METHOD, STATUS_TRANSACTION, TYPE_TRANSFER, TYPE_WALLET } from 'src/@repositories/module/mongodb/@database/enum'
import { TYPE_SUBJECT_ACTION } from 'src/@repositories/module/mongodb/@database/enum/base.enum'
import { MomoService } from 'src/@share-module/@momo/momo.service'
import { CONFIG_VNPAY } from 'src/@share-module/vnpay/config'
import { VnpayService } from 'src/@share-module/vnpay/vnpay.service'
import { CustomerOopSystemService } from 'src/core-system/@oop-system/customer-oop-system/customer-oop-system.service'
import { HistoryActivityOopSystemService } from 'src/core-system/@oop-system/history-activity-oop-system/history-activity-oop-system.service'
import { TransactionOopSystemService } from 'src/core-system/@oop-system/transaction-oop-system/transaction-oop-system.service'
import { JobSystemService } from '../job-system/job-system.service'
import { NotificationSystemService } from '../notification-system/notification-system.service'
import { TransactionSystemService } from '../transaction-system/transaction-system.service'

@Injectable()
export class PaymentSystemService {
    constructor(
        private transactionSystemService: TransactionSystemService,
        private transactionOopSystemService: TransactionOopSystemService,
        private customerOopSystemService: CustomerOopSystemService,
        private historyActivityOopSystemService: HistoryActivityOopSystemService,
        private momoService: MomoService,
        private vnpayService: VnpayService,
        @Inject(forwardRef(() => JobSystemService))
        private jobSystemService: JobSystemService,
        private notificationSystemService: NotificationSystemService,
        // private personalityPayosService: PersonalityPayosService,
    ) { }

    async createLinkPayment(lang, payload, subjectAction, user) {

        try {

            const newTransaction = await this.transactionSystemService.createTransaction(lang, subjectAction, user, payload);
            const isCustomer = subjectAction.type === TYPE_SUBJECT_ACTION.customer ? true : false;
            const result = await this.momoService.createPaymentLink(lang, payload, user, newTransaction, isCustomer);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async createPaymentLink(lang, subjectAction, payload, request, user, payment_type, isAutoCapture) {
        try {
            const newTransaction = await this.transactionSystemService.createTransaction(lang, subjectAction, user, payload);
            let result:any
            if (payment_type === PAYMENT_METHOD.momo) {
                result = await this.momoService.createNormalPaymentLink(lang, payload, user, newTransaction, isAutoCapture);
                newTransaction.momo_transfer = result
            }

            if (payment_type === PAYMENT_METHOD.vnpay || payment_type === PAYMENT_METHOD.vnbank || payment_type === PAYMENT_METHOD.intcard) {
                payload['payment_type'] = payment_type === PAYMENT_METHOD.vnpay ? 'VNPAYQR' : payment_type.toUpperCase()
                payload['transferNote'] = newTransaction.transfer_note
                payload['query'] = {
                    amount: payload.money
                }
                payload['headers'] = request['headers']
                payload['connection'] = request['connection']
                payload['socket'] = request['socket']
                const newResult = await this.createVnpayPaymentLink(lang, payload)
                newTransaction.vnpay_transfer = newResult
                result = newResult.vnpUrl
            }

            await this.transactionOopSystemService.updateTransaction(lang, newTransaction)
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getTokenMomo(lang, user, subjectAction) {
        try {
            const idCustomer = user._id
            const isCustomer = subjectAction.type === TYPE_SUBJECT_ACTION.customer ? true : false;
            const result = await this.customerOopSystemService.getTokenMomoCustomer(lang, idCustomer);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async isLinkMomoCustomer(lang, user, subjectAction) {

        try {
            const idCustomer = user._id
            const isCustomer = subjectAction.type === TYPE_SUBJECT_ACTION.customer ? true : false;
            const result = await this.customerOopSystemService.isLinkMomoCustomer(lang, idCustomer);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async paymentLinkMomo(lang, payload, subjectAction, user) {
        try {
            const idCustomer = user._id
            const isCustomer = subjectAction.type === TYPE_SUBJECT_ACTION.customer ? true : false;
            const newTransaction = await this.transactionSystemService.createTransaction(lang, subjectAction, user, payload);
            const token = await this.customerOopSystemService.getTokenMomoCustomer(lang, idCustomer);
            const result = await this.momoService.payment(lang, payload, user, newTransaction, isCustomer, token);

            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    async payOrder(lang, subjectAction, payload, user, isCustomer: boolean) {
        try {
            const result = await this.momoService.payWithRecurringToken(lang, payload, user, isCustomer);


            // Doan nay xu ly loi sau
            if (result.resultCode !== 0 && result.resultCode !== 9000) {
                return true
            }

            const payloadCreateTransaction: createTransactionDTO = {
                id_customer: subjectAction._id,
                money: payload.money,
                subject: subjectAction.type,
                transfer_note: null,
                momo_transfer: result,
                id_order: payload.order._id,
                id_group_order: payload.group_order._id,
                type_transfer: TYPE_TRANSFER.confirm_payment,
                payment_out: PAYMENT_ENUM.momo,
                payment_in: PAYMENT_ENUM.momo,
                type_wallet: TYPE_WALLET.pay_point,
                status: STATUS_TRANSACTION.create
            }
            await this.transactionSystemService.createTransaction(lang, subjectAction, user, payloadCreateTransaction);

            return true
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async confirmPayment(lang, payload, isConfirm) {
        try {
            const getTransaction = await this.transactionOopSystemService.getDetailItemByIdGroupOrder(lang, payload.id_order)

            if (isConfirm) {
                const result = await this.momoService.confirmPayment(lang, payload, isConfirm)

                getTransaction.momo_transfer = result
                getTransaction.status = STATUS_TRANSACTION.done

                await this.transactionOopSystemService.updateTransaction(lang, getTransaction)
            } else {
                await this.momoService.confirmPayment(lang, payload, isConfirm)
                await this.transactionOopSystemService.deletePermanentlyTransaction(lang, getTransaction._id)
            }

            return true
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async cleanlTokenPayment(lang, payload, subjectAction, user) {
        try {
            const idCustomer = user._id
            const newTransaction = await this.transactionSystemService.createTransaction(lang, subjectAction, user, payload);
            const isCustomer = subjectAction.type === TYPE_SUBJECT_ACTION.customer ? true : false;
            const token: string = await this.customerOopSystemService.getTokenMomoCustomer(lang, idCustomer);
            const result = await this.momoService.cleanToken(lang, payload, user, newTransaction, isCustomer, token);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async useWalletLinkedMomoPayment(lang, payloadDependency, subjectAction, user) {
        try {
            const payloadMomo = {
                id_order: payloadDependency.order._id,
                id_view: payloadDependency.order.id_view,
                money: payloadDependency.order.final_fee,
                token: payloadDependency.customer.token_payment_momo
            }
            return await this.payOrder(lang, subjectAction, payloadMomo, user, true)
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async payForOrderWithEWallet(lang, subjectAction, payloadDependency, user, payment_type, request, isAutoCapture) {
        try {
            const payload = {
                id_order: payloadDependency.order._id,
                id_group_order: payloadDependency.group_order._id,
                money: payloadDependency.group_order.final_fee,
                id_customer: payloadDependency.customer._id,
                subject: TYPE_SUBJECT_ACTION.customer,
                transfer_note: null,
                type_transfer: TYPE_TRANSFER.order_payment,
                payment_out: PAYMENT_ENUM[payment_type],
                payment_in: PAYMENT_ENUM.cash_book,
                type_wallet: TYPE_WALLET.pay_point,
                status: STATUS_TRANSACTION.processing
            }

            return await this.createPaymentLink(lang, subjectAction, payload, request, user, payment_type, isAutoCapture)
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async createTopUpLink(lang, subjectAction, payload, user) {
        try {
            const payloadCreate = {
                money: payload.query.amount,
                id_customer: subjectAction._id,
                subject: TYPE_SUBJECT_ACTION.customer,
                transfer_note: null,
                type_transfer: TYPE_TRANSFER.top_up,
                payment_out: PAYMENT_ENUM[payload.query.payment_type],
                payment_in: PAYMENT_ENUM[payload.query.payment_type],
                type_wallet: TYPE_WALLET.pay_point,
                status: STATUS_TRANSACTION.processing
            }

            payload.query.is_auto_capture = +payload.query.is_auto_capture === 1 ? true : false

            return await this.createPaymentLink(lang, subjectAction, payloadCreate, payload, user, payload.query.payment_type, payload.query.is_auto_capture)
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async createVnpayPaymentLink(lang, payload) {
        try {
            const returnUrl = CONFIG_VNPAY.vnp_ReturnUrl_Customer
            payload.query["orderDescription"] = payload.transferNote;
            payload.query["orderType"] = 78;
            payload.query["returnUrl"] = returnUrl;
            payload.query["bankCode"] = payload.payment_type;

            return await this.vnpayService.createPaymentUrl(lang, payload);
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async vnpayReturn(lang, payload) {
        try {
            const responseCode = payload.query['vnp_ResponseCode'];
            if (responseCode === "00") {
                // const timeout = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
                // setTimeout(() => {
                //     this.vnpayIPN(lang, payload);
                // }, 3000);
                return "success";
            }
            else return 'error';
        } catch (err) {
            return 'error';
        }
    }

    async vnpayIPN(lang, payload, ipAddr?) {
        try {
            const transaction = await this.transactionOopSystemService.getDetailItemByTransferNote(lang, payload.query["vnp_OrderInfo"]);
            const response = await this.vnpayService.vnpayIpn(lang, payload);
            if(transaction.id_group_order !== null && transaction.id_group_order !== undefined) {
                payload["orderId"] = transaction.id_group_order
                return await this.handleOrderPayment(lang, payload, transaction, response)
            } else {
                return await this.handleTopUp(lang, payload, transaction, response)
            }
        } catch (err) {
            const result = {
                RspCode: '99',
                Message: 'Unknow error'
            }
            return result;
        }
    }

    async handleOrderPayment(lang, payload, transaction, response) {
        try {
            payload["orderId"] = transaction.id_group_order
            if (response.responseCode === "00") {
                if (transaction.money !== Number(payload.query["vnp_Amount"] / 100)) {
                    const result = {
                        Message: "Invalid amount",
                        RspCode: "04"
                    };
                    return result;
                }
                if (response.secureHash !== response.signed) {
                    await this.jobSystemService.cancelGroupOrder(lang, payload["orderId"])
                    const result = {
                        Message: "Invalid Checksum",
                        RspCode: "97"
                    };
                    return result;
                }
                if (transaction.vnpay_transfer.vnp_TxnRef !== payload.query["vnp_TxnRef"]) {
                    await this.jobSystemService.cancelGroupOrder(lang, payload["orderId"])
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
                await this.jobSystemService.processingToPending(lang, payload)
                const result = {
                    RspCode: '00',
                    Message: 'Confirm Success'
                }
                return result;
            } else if (response.responseCode === "99") {
                await this.jobSystemService.cancelGroupOrder(lang, payload["orderId"])
                const result = {
                    RspCode: '00',
                    Message: 'Confirm Success'
                }
                return result;
            }
            else {
                await this.jobSystemService.cancelGroupOrder(lang, payload["orderId"])
                const result = {
                    Message: "Invalid Checksum",
                    RspCode: "97"
                };
                return result;
            }
        } catch (err) {
            const result = {
                Message: "Invalid Checksum",
                RspCode: "97"
            };
            return result;
        }
    }

    async handleTopUp(lang, payload, transaction, response) {
        try {
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
                const subjectAction = {
                    _id: transaction.id_customer,
                    type :TYPE_SUBJECT_ACTION.customer
                }

                const payloadDependency = {
                    customer: null,
                    transaction: null
                }

                const resultVerify = await this.transactionSystemService.verifyTransaction(lang, subjectAction, transaction._id)
                payloadDependency.customer = resultVerify.customer
                payloadDependency.transaction = resultVerify.transaction
                await this.historyActivityOopSystemService.verifyTopUpCustomer(subjectAction, payloadDependency);
                await this.notificationSystemService.verifyTopUpCustomer(lang, resultVerify.transaction, resultVerify.customer)
                
                const result = {
                    RspCode: '00',
                    Message: 'Confirm Success'
                }
                return result;
            } else if (response.responseCode === "99") {
                transaction.status = 'fail';
                await this.transactionOopSystemService.updateTransaction(transaction._id, transaction)
                const result = {
                    RspCode: '00',
                    Message: 'Confirm Success'
                }
                return result;
            }
            else {
                await this.transactionOopSystemService.updateTransaction(transaction._id, transaction)
                const result = {
                    Message: "Invalid Checksum",
                    RspCode: "97"
                };
                return result;
            }
        } catch (err) {
            const result = {
                Message: "Invalid Checksum",
                RspCode: "97"
            };
            return result;
        }
    }
}