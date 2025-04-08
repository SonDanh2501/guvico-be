import { HttpService } from '@nestjs/axios'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import * as crypto from 'crypto'
import { config_payos_test } from '../config-payos'

@Injectable()
export class PersonalityPayosService {
  constructor(
    private readonly httpService: HttpService,

) { }

  async createLinkPayment(payload) {
    try {
        const orderCode = Number(String(new Date().getTime()).slice(-6))        
        const description = 'Thanh toán đơn hàng'
        const returnUrl = 'https://admin-dev-guvico.vercel.app/'
        const cancelUrl = 'https://admin-dev-guvico.vercel.app/'

        let signature = `amount=${payload.amount}&cancelUrl=${cancelUrl}&description=${description}&orderCode=${orderCode}&returnUrl=${returnUrl}`;

        signature = crypto.createHmac('sha256', config_payos_test.checksum_key).update(signature).digest('hex')

        const body = {
          "orderCode": orderCode,
          "amount": payload.amount,
          "description": description,
          "cancelUrl": "https://admin-dev-guvico.vercel.app/",
          "returnUrl": "https://admin-dev-guvico.vercel.app/",
          "signature": signature
        }
          let result:any
          await this.httpService.axiosRef.post(
            config_payos_test.api_payment_request, 
            body,
            {
              headers: {
                'x-client-id': config_payos_test.client_id, 
                'x-api-key': config_payos_test.api_key
              }
            }
          ).then(e => {
            result = e.data
        }).catch(e => {
            result = e.data
        })
        return result;
    } catch (err) {
        throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  }

  async cancelLinkPayment(payload) {
    try {
        const cancellationReason = 'Hủy đơn hàng'

        const body = {
          "cancellationReason": payload.cancellationReason,
        }
          let result:any
          await this.httpService.axiosRef.post(
            `https://api-merchant.payos.vn/v2/payment-requests/${payload.orderCode}/cancel`, 
            body,
            {
              headers: {
                'x-client-id': config_payos_test.client_id, 
                'x-api-key': config_payos_test.api_key
              }
            }
          ).then(e => {
            result = e.data
        }).catch(e => {
            result = e.data
        })
        return result;
    } catch (err) {
        throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  }
}
