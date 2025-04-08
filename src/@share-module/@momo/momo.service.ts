import { HttpService } from '@nestjs/axios'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import * as base64 from 'base-64'
import * as crypto from 'crypto'
import * as cryptojs from 'crypto-js'
import { createPaymentDTO } from '../momo/dto/momo.dto'
import { config_momo_test, config_momo } from './config'


const configMomo:any = config_momo
// const configMomo:any = config_momo_test
// const configMomo:any = config_momo_dev
@Injectable()
export class MomoService {
    constructor(
        private readonly httpService: HttpService,

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

    async createPaymentLink(lang, payload: createPaymentDTO, user, transaction, isCustomer: boolean) {
        try {
            const ipnUrl = configMomo.ipn_link_url;
            const id_user = user._id
            const autoCapture = true;
            const orderInfo = transaction.transfer_note;
            const requestId = `${transaction._id}`;
            const redirec_url = isCustomer ? configMomo.redirec_url_customer : configMomo.redirec_url_partner;
            const stringifyObj: string = JSON.stringify({
                "full_name": user.full_name,
                "phone": user.phone,
                "code_phone_area": user.code_phone_area,
                "date_create": new Date(Date.now()).toISOString(),
                "amount": payload.money,
                "id_order": orderInfo,
            });
            const encodedWord = Buffer.from(stringifyObj, 'utf-8');
            const extraData = encodedWord.toString('base64');

            let signature = "accessKey=" + configMomo.access_key + "&amount=" + payload.money
                + "&extraData=" + extraData + "&ipnUrl=" + ipnUrl + "&orderId=" + transaction._id
                + "&orderInfo=" + orderInfo +
                "&partnerClientId=" + id_user +
                "&partnerCode=" + configMomo.partner_code + "&redirectUrl=" + redirec_url
                + "&requestId=" + requestId + "&requestType=" + "linkWallet";

            signature = crypto.createHmac('sha256', configMomo.secret_key).update(signature).digest('hex')

            const body = {
                "partnerCode": configMomo.partner_code,
                "partnerName": configMomo.partner_name,
                "requestType": "linkWallet",
                "ipnUrl": ipnUrl,
                "redirectUrl": redirec_url,
                "orderId": transaction._id.toString(), // cần tạo ra transaction để lấy thông tin id_order
                "amount": payload.money,
                "lang": lang,
                "autoCapture": autoCapture,
                "orderInfo": orderInfo,
                "partnerClientId": id_user,
                "requestId": requestId, // định danh duy nhất của một request
                "extraData": extraData, // key để bảo mật thông tin bên mình gửi qua momo để dành cho các đối chiếu sau này
                "signature": signature // key bảo mật thông tin cho request và dùng để đối chiếu với bên momo để xác minh tính đúng đắn
            }
            let result: any;
            await this.httpService.axiosRef.post(configMomo.api_endpoint, body).then(e => {
                result = e.data
            }).catch(e => {
                result = e.response.data
            })
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getRecurringToken(lang, payload) {
        try {
            console.log('âaaaa')
            const id_user = payload.partnerClientId
            const requestId = payload.requestId;
            const callbackToken = payload.callbackToken
            let signature = "accessKey=" + configMomo.access_key + "&callbackToken=" + callbackToken
            "&orderId=" + payload.orderId + "&partnerClientId=" + id_user + "&partnerCode=" + configMomo.partner_code + "&requestId=" + requestId

            signature = crypto.createHmac('sha256', configMomo.secret_key).update(signature).digest('hex')

            const body = {
                "partnerCode": configMomo.partner_code,
                "callbackToken": callbackToken,
                "requestId": requestId,
                "orderId": payload.orderId,
                "partnerClientId": id_user,
                "lang": lang,
                "signature": signature
            }
            let result: any;

            await this.httpService.axiosRef.post(configMomo.api_endpoint_get_recurring_token, body).then(e => {
                const aesToken = e.data.aesToken

                const token = this.decryptAES(configMomo.secret_key, aesToken)
                console.log('ssstoken', token)

                console.log("e.data", e.data)

                result = token
            }).catch(e => {
                console.log('e', e)
                result = e.response.data
            })
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    async payment(lang, payload: createPaymentDTO, user, transaction, isCustomer: boolean, token: string) {
        try {
            const ipnUrl = configMomo.ipn_url;
            const autoCapture = true;
            const id_user = user._id
            const orderInfo = transaction.transfer_note;
            const requestId = `${transaction._id}`;
            const redirec_url = isCustomer ? configMomo.redirec_url_customer : configMomo.redirec_url_partner;
            const stringifyObj: string = JSON.stringify({
                "full_name": user.full_name,
                "phone": user.phone,
                "code_phone_area": user.code_phone_area,
                "date_create": new Date(Date.now()).toISOString(),
                "amount": payload.money,
                "id_order": orderInfo,
            });
            const encodedWord = Buffer.from(stringifyObj, 'utf-8');
            const extraData = encodedWord.toString('base64');
            let signature = "accessKey=" + configMomo.access_key + "&amount=" + payload.money
                + "&extraData=" + extraData + "&orderId=" + transaction._id
                + "&orderInfo=" + orderInfo + "&partnerClientId=" + id_user + "&partnerCode=" + configMomo.partner_code + "&redirectUrl=" + redirec_url
                + "&requestId=" + requestId + "&token=" + token
            signature = crypto.createHmac('sha256', configMomo.secret_key).update(signature).digest('hex')
            const body = {
                "partnerCode": configMomo.partner_code,
                "partnerName": configMomo.partner_name,
                "orderId": transaction._id.toString(), // cần tạo ra transaction để lấy thông tin id_order
                "amount": payload.money,
                "requestId": requestId, // định danh duy nhất của một request
                "token": token,
                // "ipnUrl": ipnUrl,
                // "redirectUrl": redirec_url,
                "partnerClientId": id_user,
                "orderInfo": orderInfo,
                "autoCapture": autoCapture,
                "extraData": extraData, // key để bảo mật thông tin bên mình gửi qua momo để dành cho các đối chiếu sau này
                "lang": lang,

                "signature": signature // key bảo mật thông tin cho request và dùng để đối chiếu với bên momo để xác minh tính đúng đắn
            }
            console.log('==> body ', body);
            let result: any;
            await this.httpService.axiosRef.post(configMomo.api_endpoint, body).then(e => {
                result = e.data
            }).catch(e => {
                result = e.response.data
            })
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }



    decryptAES(secretKey: string, encryptData: string) {
        try {
            const iv = Buffer.alloc(16, 0); // IV với 16 byte đều là 0
            const key = Buffer.from(secretKey, 'utf-8'); // Tạo key từ secretKey
            const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

            // Giải mã dữ liệu đã mã hóa
            let decrypted = decipher.update(base64.decode(encryptData), 'base64', 'utf8');
            decrypted += decipher.final('utf8');

            return decrypted;
        } catch (error) {
            console.error(error);
            return '';
        }
    }

    async payWithRecurringToken(lang, payload, user, isCustomer) {
        try {
            const id_user = user._id
            const orderId = payload.id_order;
            const userInfo = { partnerClientAlias: user.phone }
            const orderInfo = payload.id_view
            const requestId = `${payload.id_order}`;
            const redirec_url = isCustomer ? configMomo.redirec_url_customer : configMomo.redirec_url_partner;
            const stringifyObj: string = JSON.stringify({
                "full_name": user.full_name,
                "phone": user.phone,
                "code_phone_area": user.code_phone_area,
                "date_create": new Date(Date.now()).toISOString(),
                "amount": payload.money,
                "id_order": orderId,
            });
            const encodedWord = Buffer.from(stringifyObj, 'utf-8');
            const extraData = encodedWord.toString('base64');
            let signature = `accessKey=${configMomo.access_key}&amount=${payload.money}&extraData=${extraData}
&orderId=${orderId}&orderInfo=${orderInfo}&partnerClientId=${id_user}&partnerCode=${configMomo.partner_code}
&requestId=${requestId}&token=${payload.token}`

            signature = crypto.createHmac('sha256', configMomo.secret_key).update(signature).digest('hex')

            const requestBody = {
                "partnerCode": configMomo.partner_code,
                "partnerName": configMomo.partner_name,
                "orderId": orderId.toString(),
                "amount": payload.money,
                "requestId": requestId,
                "token": payload.token,

                "partnerClientId": id_user,
                "orderInfo": orderInfo,
                "autoCapture": false,
                "redirectUrl": redirec_url,
                "ipnUrl": configMomo.ipn_link_url,
                "extraData": extraData,
                "userInfo": userInfo,
                "lang": lang,

                "signature": signature
            }
            let result: any;
            await this.httpService.axiosRef.post(configMomo.api_endpoint_pay, requestBody).then(e => {

                result = e.data
            }).catch(e => {
                result = e.response.data
            })
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    async cleanToken(lang, payment, user, transaction, isCustomer: boolean, token: string) {
        try {
            const id_user = user._id
            const requestId = `${transaction._id}`;
            const redirec_url = isCustomer ? configMomo.redirec_url_customer : configMomo.redirec_url_partner;
            let signature = "accessKey=" + configMomo.access_key + "&orderId=" + transaction._id
                + "&partnerClientId=" + id_user + "&partnerCode=" + configMomo.partner_code + "&redirectUrl=" + redirec_url
                + "&requestId=" + requestId + "&token=" + token
            signature = crypto.createHmac('sha256', configMomo.secret_key).update(signature).digest('hex')
            const body = {
                "partnerCode": configMomo.partner_code,
                "orderId": transaction._id.toString(), // cần tạo ra transaction để lấy thông tin id_order
                "requestId": requestId, // định danh duy nhất của một request
                "token": token,
                "signature": signature // key bảo mật thông tin cho request và dùng để đối chiếu với bên momo để xác minh tính đúng đắn
            }
            let result: any;
            await this.httpService.axiosRef.post(configMomo.api_endpoint, body).then(e => {

                result = e.data
            }).catch(e => {
                result = e.response.data
            })
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async confirmPayment(lang, payload, isConfirm) {
        try {
            const orderId = payload.id_order;
            const requestType = isConfirm ? 'capture' : 'cancel'
            const requestId = `${payload.id_order}`;
            const description = isConfirm ? '' : 'Hủy đơn hàng'

            let signature = `accessKey=${configMomo.access_key}&amount=${payload.money}&description=${description}&orderId=${orderId}&partnerCode=${configMomo.partner_code}&requestId=${requestId}&requestType=${requestType}`
            const hash = cryptojs.HmacSHA256(signature, configMomo.secret_key);
            signature = cryptojs.enc.Hex.stringify(hash);

            const requestBody = {
                "partnerCode": configMomo.partner_code,
                "partnerName": configMomo.partner_name,
                "requestId": requestId,
                "orderId": orderId.toString(),
                "requestType": requestType,
                "amount": payload.money,
                "lang": lang,
                "description": description,
                "signature": signature
            }

            let result: any;
            await this.httpService.axiosRef.post(configMomo.api_endpoint_confirm, requestBody).then(e => {
                result = e.data
            }).catch(e => {
                result = e.response.data
            })
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async createNormalPaymentLink(lang, payload: createPaymentDTO, user, transaction, isAutoCapture) {
        try {
            const ipnUrl = configMomo.handle_momo_payment;
            const autoCapture = isAutoCapture;
            const orderInfo = transaction.transfer_note;
            const requestId = `${transaction._id}`;
            const redirec_url =  configMomo.redirec_url_customer;
            const stringifyObj: string = JSON.stringify({
                "full_name": user.full_name,
                "phone": user.phone,
                "code_phone_area": user.code_phone_area,
                "date_create": new Date(Date.now()).toISOString(),
                "amount": payload.money,
                "id_group_order": payload.id_group_order,
            });
            const encodedWord = cryptojs.enc.Utf8.parse(stringifyObj);
            const extraData = cryptojs.enc.Base64.stringify(encodedWord)
            let signature = `accessKey=${configMomo.access_key}&amount=${payload.money}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${payload.id_group_order}&orderInfo=${orderInfo}&partnerCode=${configMomo.partner_code}&redirectUrl=${redirec_url}&requestId=${requestId}&requestType=${configMomo.request_type}`
            const hash = cryptojs.HmacSHA256(signature, configMomo.secret_key);
            signature = cryptojs.enc.Hex.stringify(hash);
            const body = {
                "partnerCode": configMomo.partner_code,
                "partnerName": configMomo.partner_name,
                "requestType": configMomo.request_type,
                "ipnUrl": ipnUrl,
                "redirectUrl": redirec_url,
                "orderId": payload.id_group_order.toString(),
                "amount": payload.money,
                "lang": lang,
                "autoCapture": autoCapture,
                "orderInfo": orderInfo,
                "requestId": requestId, // định danh duy nhất của một request
                "extraData": extraData, // key để bảo mật thông tin bên mình gửi qua momo để dành cho các đối chiếu sau này
                "signature": signature // key bảo mật thông tin cho request và dùng để đối chiếu với bên momo để xác minh tính đúng đắn
            }
            let result: any;
            await this.httpService.axiosRef.post(configMomo.api_endpoint, body).then(e => {
                result = e.data
            }).catch(e => {
                result = e.response.data
            })
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
