import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { TYPE_USER_OBJECT } from 'src/@repositories/module/mongodb/@database/enum/base.enum'
import { PhoneOTPRepositoryService } from 'src/@repositories/repository-service/phone-otp-repository/phone-otp-repository.service'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
import { PHONE_OTP_TYPE } from './../../../@repositories/module/mongodb/@database/enum/base.enum'

@Injectable()
export class PhoneOTPOopSystemService {
  constructor(
    private customExceptionService: CustomExceptionService,
    private phoneOTPRepositoryService: PhoneOTPRepositoryService
){}

  async getPhoneOTPByPhone(payload, user_type) {
      try {
        const query:any = { 
          $and: [
            { type: PHONE_OTP_TYPE.etelecom },
            { user_type: TYPE_USER_OBJECT[user_type] },
            { code_phone_area: payload.code_phone_area },
            { phone: payload.phone },
          ]
        }

        return await this.phoneOTPRepositoryService.findOne(query, {}, { date_create: -1 })
      } catch (err) {
          throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
      }
  }

  async createItem(payload) {
    try {
        const result = await this.phoneOTPRepositoryService.create(payload)
        return result
    } catch (err) {
        throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async countPhoneOTPByPhone(payload, user_type) {
    try {
      const startDate = new Date(new Date().setHours(0, 0, 0, 0)).toISOString()
      const endDate = new Date(new Date().setHours(23, 59, 59, 999)).toISOString()

      const query = {
        $and: [
          { type: PHONE_OTP_TYPE.etelecom },
          { user_type: user_type },
          { code_phone_area: payload.code_phone_area },
          { phone: payload.phone },
          { date_create: {
              $gte: startDate,
              $lte: endDate
            } 
          }
        ]
      }
      return await this.phoneOTPRepositoryService.countDataByCondition(query)
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async countPhoneOTPByPhoneIn30Days(payload, user_type) {
    try {
      const startDate = new Date(new Date(new Date().setDate(new Date().getDate() - 30)).setHours(0, 0, 0, 0)).toISOString()
      const endDate =  new Date(new Date().setHours(23, 59, 59, 999)).toISOString()

      const query = {
        $and: [
          { type: PHONE_OTP_TYPE.etelecom },
          { user_type: user_type },
          { code_phone_area: payload.code_phone_area },
          { phone: payload.phone },
          { date_create: {
              $gte: startDate,
              $lte: endDate
            } 
          }
        ]
      }
      return await this.phoneOTPRepositoryService.countDataByCondition(query)
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
