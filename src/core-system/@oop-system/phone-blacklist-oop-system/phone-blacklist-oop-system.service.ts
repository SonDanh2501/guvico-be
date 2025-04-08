import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { ERROR } from 'src/@core'
import { PhoneBlacklistRepositoryService } from 'src/@repositories/repository-service/phone-blacklist-repository/phone-blacklist-repository.service'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'

@Injectable()
export class PhoneBlacklistOopSystemService {
  constructor(
      private customExceptionService: CustomExceptionService,
      private phoneBlacklistRepositoryService: PhoneBlacklistRepositoryService
  ){}

    async createItem(payload) {
      try {
        return await this.phoneBlacklistRepositoryService.create(payload)
      } catch (err) {
        throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
      
    async getItemByPhoneNumber(lang, phoneNumber, isCheck: boolean = false) {
      try {
        const query = {
          $and: [
            { phone: phoneNumber }
          ]
        }
        const getItem = await this.phoneBlacklistRepositoryService.findOne(query)
        if(getItem && isCheck && !getItem.is_skipped) {
          throw new HttpException([await this.customExceptionService.i18nError(ERROR.PHONE_HAS_BEEN_BLOCKED, lang, 'phone')], HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return getItem
      } catch (err) {
        throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }


}
