import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { createPaymentMoMoDTO } from './dto/momo.dto';
import { config_momo, config_momo_test } from './config';
import { Collaborator, CollaboratorDocument, Customer, CustomerDocument, ERROR, TransitionCollaborator, TransitionCollaboratorDocument, TransitionCustomer, TransitionCustomerDocument, previousBalanceCollaboratorDTO, } from 'src/@core';
import * as crypto from 'crypto-js';
import * as qs from 'qs';
import axios from 'axios';
import { HttpService } from '@nestjs/axios';
import { CustomExceptionService } from '../custom-exception/custom-exception.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ActivityCustomerSystemService } from 'src/core-system/activity-customer-system/activity-customer-system.service';
import { ActivitySystemService } from 'src/core-system/activity-system/activity-system.service';
import { TransactionDocument } from 'src/@repositories/module/mongodb/@database/schema/transaction.schema';
import { TransactionRepositoryService } from 'src/@repositories/repository-service/transaction-repository/transaction-repository.service';
import { CustomerRepositoryService } from 'src/@repositories/repository-service/customer-repository/customer-repository.service';
import { CollaboratorRepositoryService } from 'src/@repositories/repository-service/collaborator-repository/collaborator-repository.service';
import { TransactionSystemService } from 'src/core-system/transaction-system/transaction-system.service';

@Injectable()
export class MomoService {
    constructor(
        private readonly httpService: HttpService,
        private readonly customExceptionService: CustomExceptionService,
        private readonly activityCustomerSystemService: ActivityCustomerSystemService,
        private readonly activitySystemService: ActivitySystemService,
        private readonly transactionSystemService: TransactionSystemService,


        @InjectModel(TransitionCollaborator.name) private transitionCollaboratorModel: Model<TransitionCollaboratorDocument>,
        @InjectModel(TransitionCustomer.name) private transitionCustomerModel: Model<TransitionCustomerDocument>,
        @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
        @InjectModel(Collaborator.name) private collaboratorModel: Model<CollaboratorDocument>,

        private transactionRepositoryService: TransactionRepositoryService,
        private customerRepositoryService: CustomerRepositoryService,
        private collaboratorRepositoryService: CollaboratorRepositoryService,
    ) { }
    /**
     * 
     * @param lang ngôn ngữ trả lỗi
     * @param payload bao gồm thông tin số tiền payload = {amount: number }
     * @param user thông tin khách hàng
     * @param transition thông tin của giao dịch khách hàng, CTV
     * @param isCustomer có phải là KH hay không
     * @returns 
     */
    async createPaymentUrlV2(lang, payload: createPaymentMoMoDTO, user: CustomerDocument | Collaborator, transaction: TransactionDocument, isCustomer: boolean) {
        try {
            const ipnUrl = config_momo.ipn_url;
            const autoCapture = true;
            const orderInfo = transaction.transfer_note;
            const requestId = `${transaction._id}`;
            const redirec_url = isCustomer ? config_momo.redirec_url_customer : config_momo.redirec_url_partner;
            const stringifyObj: string = JSON.stringify({
                "full_name": user.full_name,
                "phone": user.phone,
                "code_phone_area": user.code_phone_area,
                "date_create": new Date(Date.now()).toISOString(),
                "amount": payload.amount,
                "id_order": orderInfo,
            });
            const encodedWord = crypto.enc.Utf8.parse(stringifyObj);
            const extraData = crypto.enc.Base64.stringify(encodedWord)
            let signature = "accessKey=" + config_momo.access_key + "&amount=" + payload.amount
                + "&extraData=" + extraData + "&ipnUrl=" + ipnUrl + "&orderId=" + transaction._id
                + "&orderInfo=" + orderInfo + "&partnerCode=" + config_momo.partner_code + "&redirectUrl=" + redirec_url
                + "&requestId=" + requestId + "&requestType=" + config_momo.request_type;
            const hash = crypto.HmacSHA256(signature, config_momo.secret_key);
            signature = crypto.enc.Hex.stringify(hash);
            const body = {
                "partnerCode": config_momo.partner_code,
                "partnerName": config_momo.partner_name,
                "requestType": config_momo.request_type,
                "ipnUrl": ipnUrl,
                "redirectUrl": redirec_url,
                "orderId": transaction._id.toString(), // cần tạo ra transaction để lấy thông tin id_order
                "amount": payload.amount,
                "lang": lang,
                "autoCapture": autoCapture,
                "orderInfo": orderInfo,
                "requestId": requestId, // định danh duy nhất của một request
                "extraData": extraData, // key để bảo mật thông tin bên mình gửi qua momo để dành cho các đối chiếu sau này
                "signature": signature // key bảo mật thông tin cho request và dùng để đối chiếu với bên momo để xác minh tính đúng đắn
            }
            console.log('==> body ', body);
            let result: any;
            await this.httpService.axiosRef.post(config_momo.api_endpoint, body).then(e => {
                result = e.data
            }).catch(e => {
                result = e.response.data
            })
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async momoIpnV2(lang, payload) {
        try {
            const transaction = await this.transactionRepositoryService.findOneById(payload.orderId);
            if (!transaction) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            console.log('call to here 1');
            if (transaction.id_customer) {
                if (payload.resultCode === 0) {
                    await this.confirmStatusOrderV2(lang, payload);
                    const result = await this.transactionSystemService.verifyTransaction(lang, transaction._id);
                    result.transaction.momo_transfer = payload;
                    const resultTransaction = await this.transactionRepositoryService.findByIdAndUpdate(transaction._id, result.transaction);
                    await this.activitySystemService.verifyTopUpCustomer(resultTransaction, result.customer);
                    return true;
                } else {
                    transaction.status = 'cancel';
                    transaction.momo_transfer = payload;
                    this.transactionRepositoryService.findByIdAndUpdate(transaction._id, transaction);
                    this.activitySystemService.cancelTransaction(transaction);
                    return true;
                }
            } else if (transaction.id_collaborator) {
                if (payload.resultCode === 0) {
                    await this.confirmStatusOrderV2(lang, payload);
                    const getCollaborator = await this.collaboratorRepositoryService.findOneById(transaction.id_collaborator);
                    const previousBalance: previousBalanceCollaboratorDTO = {
                        collaborator_wallet: getCollaborator.collaborator_wallet,
                        work_wallet: getCollaborator.work_wallet,
                    }
                    const result = await this.transactionSystemService.verifyTransaction(lang, transaction._id);
                    result.transaction.momo_transfer = payload;
                    const resultTransaction = await this.transactionRepositoryService.findByIdAndUpdate(transaction._id, result.transaction)
                    await this.activitySystemService.verifyTopUpCollaborator(resultTransaction, result.collaborator, previousBalance);
                    return true;
                } else {
                    transaction.status = 'cancel';
                    transaction.momo_transfer = payload;
                    await this.transactionRepositoryService.findByIdAndUpdate(transaction._id, transaction)
                    this.activitySystemService.cancelTransaction(transaction);
                    return true;
                }
            }
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async confirmStatusOrderV2(lang, payload) {
        try {
            var signature = "accessKey=" + config_momo.access_key + "&orderId=" + payload.orderId
                + "&partnerCode=" + payload.partnerCode + "&requestId=" + payload.requestId;
            const hash = crypto.HmacSHA256(signature, config_momo.secret_key);
            signature = crypto.enc.Hex.stringify(hash);
            const body = {
                "partnerCode": config_momo.partner_code,
                "requestId": payload.requestId,
                "orderId": payload.orderId,
                "lang": lang,
                "signature": signature
            }
            let result: any;
            await this.httpService.axiosRef.post(config_momo.api_endpoint_query_status, body).then(async e => {
                result = e.data
                console.log('check confirm order ', result);
                if (result.resultCode !== 0) {
                    throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, 'transaction')], HttpStatus.BAD_REQUEST);
                }
            }).catch(async e => {
                console.log('why not pass ', e);
                result = e.response.data
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, 'transaction')], HttpStatus.BAD_REQUEST);
            })
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
