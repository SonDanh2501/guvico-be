import { HttpService } from '@nestjs/axios'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { lastValueFrom } from 'rxjs'
import { config_zns_dev } from './config'

const config_zns = config_zns_dev

@Injectable()
export class ZnsService {
  constructor(
    private readonly httpService: HttpService
  ) {

  }

  async callApi(url: string, data: any, config: any) {
    try {
      return new Promise((resolve) => {
      const request = this.httpService.post(url, data, { headers: config })
      lastValueFrom(request)
        .then((res) => {
          resolve(res.data)
        })
        .catch((err: any) => {
          console.log(err)
          throw err
        })
    })
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  }

   /** Lấy access token và refresh token */
  async getAccessTokenWithFreshToken(getSystemSetting) {
    try {
      const config = {
        'Content-Type': 'application/x-www-form-urlencoded',
        secret_key: config_zns.secret_key,
      }

      const obj: any = {
        refresh_token: getSystemSetting.refresh_token_zns,
        app_id: config_zns.app_id,
        grant_type: config_zns.grant_type_2,
      }

      const url = config_zns.api_get_access_token
      let formBody: any = []
      for (const property in obj) {
        const encodedKey = encodeURIComponent(property)
        const encodedValue = encodeURIComponent(obj[property])
        formBody.push(encodedKey + '=' + encodedValue)
      }
      formBody = formBody.join('&')

      let res: any = await this.callApi(url, formBody, config)

      if (res && res.access_token && res.refresh_token) {
        /** Lưu access token vào DB */
        getSystemSetting.access_token_zns = res.access_token
        getSystemSetting.refresh_token_zns = res.refresh_token

        return getSystemSetting
      } else {
        throw new HttpException([{ message: res.error_reason.toString(), field: null }], HttpStatus.FORBIDDEN);
      }


    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  }
  
  async sendOTP(getSystemSetting, codeOTP, phone_number, trackingId): Promise<any> {
    try {
      const config = {
        'Content-Type': 'application/json',
        access_token: getSystemSetting.access_token_zns,
      }
  
      const obj = {
        phone: phone_number,
        template_id: config_zns.id_template_otp,
        template_data: {
          otp: codeOTP,
        },
        tracking_id: trackingId
      }
      const url = config_zns.api_send_notification
  
      const res:any = await this.callApi(url, obj, config)
      console.log(res);

      return true
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  }
}
