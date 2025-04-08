import { HttpService } from '@nestjs/axios'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { lastValueFrom } from 'rxjs'
import { config_etelcom_prod } from './config'

const config_etelcom = config_etelcom_prod

@Injectable()
export class EtelecomService {
  constructor(
    private httpService: HttpService
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
  
  async createTemplate() {
    try {
      const headers:any = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${config_etelcom.api_key}`
      }
      const url = `${config_etelcom.base_url}.Zalo/CreateTemplate`

      const body = {
        oa_id: config_etelcom.oa_id,
        template_id: config_etelcom.id_template_otp,
        type: 'otp'
      }

      let result: any;
      await this.httpService.axiosRef.post(url, body, { headers} ).then(e => {
        result = e.data
      }).catch(e => {
        throw new HttpException(e.response.data , HttpStatus.FORBIDDEN);
      })

      return result
    } catch(err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  }

  async sendOTP(phone_number, codeOTP, tracking_id) {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${config_etelcom.api_key}`
      };
      const url = `${config_etelcom.base_url}.Zalo/SendZNS`

      const body = {
        oa_id: config_etelcom.oa_id,
        phone: phone_number,
        template_id: config_etelcom.id_template_otp,
        tracking_id: tracking_id,
        template_data: {
          otp: codeOTP,
        },
      }

      let result: any;
      await this.httpService.axiosRef.post(url, body, { headers }).then(e => {
        result = e.data
      }).catch(e => {
        throw new HttpException(e.response.data , HttpStatus.INTERNAL_SERVER_ERROR);
      });

      return true
    } catch(err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  async getListMessages(iPage) {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${config_etelcom.api_key}`
      };
      const url = `${config_etelcom.base_url}.Zalo/ListMessages`

      let body:any = {
        filter: {
          date_from: iPage.start_date,
          date_to: iPage.end_date
        },
        paging: {
          limit: iPage.length
        }
      }

      const iPageKeys = ['phone', 'status', 'template_id', 'is_charged', 'after','before'];
      const iPagaDTOKeys = Object.keys(iPage)
      let filterKey = iPageKeys.filter(key => iPagaDTOKeys.includes(key));
      for(const itemKey of filterKey) {
          if(iPage[itemKey] !== "" && iPage[itemKey] !== null && iPage[itemKey] !== undefined && itemKey !== "after" && itemKey !== "before") {
            body['filter'][`${itemKey}`] = iPage[itemKey]
          } if(iPage[itemKey] !== "" && iPage[itemKey] !== null && iPage[itemKey] !== undefined && (itemKey === 'after' || itemKey === 'before')) {
            body['paging'][`${itemKey}`] = iPage[itemKey]
          }
      }


      let result: any;
      await this.httpService.axiosRef.post(url, body, { headers }).then(e => {
        result = e.data
      }).catch(e => {
        throw new HttpException(e.response.data , HttpStatus.INTERNAL_SERVER_ERROR);
      });

      return result
    } catch(err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
