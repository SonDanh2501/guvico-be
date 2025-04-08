import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service'
import { DeviceTokenOopSystemService } from 'src/core-system/@oop-system/device-token-oop-system/device-token-oop-system.service'
import { FIRBASE_EXPIRATION_TIME } from './../../../@core/constant/constant'

@Injectable()
export class DeviceTokenSystemService {
  constructor(       
      private customExceptionService: CustomExceptionService,
      private generalHandleService: GeneralHandleService,
      
      private deviceTokenOopSystemService: DeviceTokenOopSystemService
    ){}

    /** Kiem tra device token het han hay chua
     *  Neu het roi thi tra ve true
     *  Neu chua het thi tra ve false
     *  */ 
    async checkExpirationTimeHasExpired(lang, subjectAction) {
      try {
        const deviceToken = await this.deviceTokenOopSystemService.getDetailItemByUserId(lang, subjectAction._id)
        if(!deviceToken || deviceToken === null || deviceToken === undefined) {
          return true
        }
        const currentTime = (Date.now() - new Date(deviceToken.date_update).getTime()) / (1000 * 60 * 60 * 24)

        if (currentTime > FIRBASE_EXPIRATION_TIME) {
          return true
        }

        return false
      } catch (err) {
        throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    async updateDeviceToken(subjectAction, payload) {
      try {
        return await this.deviceTokenOopSystemService.updateDeviceToken(subjectAction, payload)
      } catch (err) {
        throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
}
