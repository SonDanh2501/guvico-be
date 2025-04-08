import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CONFIG_VNPAY } from './config';
import * as crypto from 'crypto-js';
import * as qs from 'qs';
import * as moment from 'moment';
import { CustomExceptionService } from '../custom-exception/custom-exception.service';
import { ERROR } from 'src/@core';




@Injectable()
export class VnpayService {
    constructor(
        private readonly httpService: HttpService,
        private customExceptionService: CustomExceptionService,
    ) { }

    async createPaymentUrl(lang, payload) {
        try {
            const ipAddr = payload.headers['x-forwarded-for'] ||
                payload.connection.remoteAddress ||
                payload.socket.remoteAddress ||
                payload.connection.socket.remoteAddress;
            const tmnCode = CONFIG_VNPAY.vnp_TmnCode
            const secretKey = CONFIG_VNPAY.vnp_HashSecret
            let vnpUrl = CONFIG_VNPAY.vnp_Url
            const returnUrl = payload.query.returnUrl
            const amount = payload.query.amount;
            const bankCode = payload.query.bankCode || "";
            const locale = (lang = "vi") ? "vn" : lang;
            // const date = new Date(Number(new Date().getTime() - (7 * 60 * 60 * 1000)));
            const date = new Date();
            const orderInfo = payload.query.orderDescription;
            const orderType = payload.query.orderType;
            const createDate = moment(date).format('yyyyMMDDHHmmss');
            const orderId = moment(date).format('hhmmss');
            const currCode = 'VND';
            let vnp_Params = {};
            vnp_Params['vnp_Version'] = '2.1.0';
            vnp_Params['vnp_Command'] = 'pay';
            vnp_Params['vnp_TmnCode'] = tmnCode;
            vnp_Params['vnp_Locale'] = locale;
            vnp_Params['vnp_CurrCode'] = currCode;
            vnp_Params['vnp_TxnRef'] = orderId;
            vnp_Params['vnp_OrderInfo'] = orderInfo;
            vnp_Params['vnp_OrderType'] = orderType;
            vnp_Params['vnp_Amount'] = amount * 100;
            vnp_Params['vnp_ReturnUrl'] = returnUrl;
            vnp_Params['vnp_IpAddr'] = ipAddr;
            vnp_Params['vnp_CreateDate'] = createDate;
            if (payload.query["bankCode"] !== null) {
                vnp_Params['vnp_BankCode'] = payload.query["bankCode"]
            }
            if (bankCode !== null && bankCode !== '') {
                vnp_Params['vnp_BankCode'] = bankCode;
            }
            vnp_Params = await this.sortObject(vnp_Params);
            const signData = qs.stringify(vnp_Params, { encode: false });
            const crypted = crypto.HmacSHA512(signData, secretKey)
            const signed = crypto.enc.Hex.stringify(crypted)
            vnp_Params['vnp_SecureHash'] = signed;
            vnpUrl += '?' + qs.stringify(vnp_Params, { encode: false });
            const result = {
                vnp_TxnRef: orderId,
                vnp_SecureHash: signed,
                vnpUrl: vnpUrl
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    async vnpayIpn(lang, payload) {
        try {
            var vnp_Params = payload.query;

            const secureHash = vnp_Params['vnp_SecureHash'];

            delete vnp_Params['vnp_SecureHash'];
            delete vnp_Params['vnp_SecureHashType'];

            vnp_Params = await this.sortObject(JSON.parse(JSON.stringify(vnp_Params)));

            // const tmnCode = CONFIG_VNPAY.vnp_TmnCode
            const secretKey = CONFIG_VNPAY.vnp_HashSecret
            let vnpUrl = CONFIG_VNPAY.vnp_Ipn
            // const returnUrl = CONFIG_VNPAY.vnp_ReturnUrl 


            const signData = qs.stringify(vnp_Params, { encode: false });
            const crypted = crypto.HmacSHA512(signData, secretKey)
            // const crypted = crypto.HmacSHA256(signData, secretKey)
            const signed = crypto.enc.Hex.stringify(crypted)
            vnpUrl += '?' + qs.stringify(vnp_Params, { encode: false });
            const responseCode = vnp_Params['vnp_ResponseCode'];
            const result = {
                secureHash: secureHash,
                signed: signed,
                responseCode: responseCode
            }
            return result;
            // if (secureHash === signed) {
            //     return responseCode;
            //     // switch (responseCode) {
            //     //     case "00":
            //     //         return true;
            //     //         // throw new HttpException([await this.customExceptionService.i18nError(ERROR.PAYMENT.SUCCESS, lang, null)], HttpStatus.OK);
            //     //     case "07":
            //     //         return 'error';
            //     //         // throw new HttpException([await this.customExceptionService.i18nError(ERROR.PAYMENT.QUESTIONABLE_TRANSACTION, lang, null)], HttpStatus.OK);
            //     //     // case "09":
            //     //     //     throw new HttpException([await this.customExceptionService.i18nError(ERROR.PAYMENT.QUESTIONABLE_TRANSACTION, lang, null)], HttpStatus.CONFLICT);
            //     //     default:
            //     //         return 'error';
            //     //         // throw new HttpException([await this.customExceptionService.i18nError(ERROR.PAYMENT.EXCEPTION_ERROR, lang, null)], HttpStatus.INTERNAL_SERVER_ERROR);
            //     // }
            // } else {
            //     // return 97;
            //     throw new HttpException([await this.customExceptionService.i18nError(ERROR.PAYMENT.EXCEPTION_ERROR, lang, null)], HttpStatus.INTERNAL_SERVER_ERROR);
            // }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // async vnpayIpn(lang, payload) {
    //     try {
    //         var vnp_Params = payload.query;

    //         const secureHash = vnp_Params['vnp_SecureHash'];

    //         delete vnp_Params['vnp_SecureHash'];
    //         delete vnp_Params['vnp_SecureHashType'];

    //         vnp_Params = await this.sortObject(vnp_Params);

    //         // const tmnCode = CONFIG_VNPAY.vnp_TmnCode
    //         const secretKey = CONFIG_VNPAY.vnp_HashSecret
    //         let vnpUrl = CONFIG_VNPAY.vnp_Ipn

    //         const signData = qs.stringify(vnp_Params, { encode: false });
    //         const crypted = crypto.HmacSHA512(signData, secretKey)
    //         // const crypted = crypto.HmacSHA256(signData, secretKey)
    //         const signed = crypto.enc.Hex.stringify(crypted)
    //         vnpUrl += '?' + qs.stringify(vnp_Params, { encode: false });
    //         const responseCode = vnp_Params['vnp_ResponseCode'];
    //         if (secureHash === signed) {
    //             return responseCode;
    //         } else {

    //         }
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }

    async sortObject(obj) {
        var sorted = {};
        var str = [];
        var key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                str.push(encodeURIComponent(key));
            }
        }
        str.sort();
        for (key = 0; key < str.length; key++) {
            sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
        }
        return sorted;
    }
}
