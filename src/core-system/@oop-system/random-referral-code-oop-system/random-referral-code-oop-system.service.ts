import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { RandomReferralCodeRepositoryService } from 'src/@repositories/repository-service/random-referral-code-repository/random-referral-code-repository.service'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'

@Injectable()
export class RandomReferralCodeOopSystemService {
  constructor(
    private customExceptionService: CustomExceptionService,
    private randomReferralCodeRepositoryService: RandomReferralCodeRepositoryService
  ) { }

  async getListOfCodesUsed() {
    try {
      const query = {
        $and: [
          { is_used: true }
        ]
      }
      return await this.randomReferralCodeRepositoryService.getListDataByCondition(query)
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createMany(multiRandomReferralCode) {
    try {
        return await this.randomReferralCodeRepositoryService.createMany(multiRandomReferralCode);
    } catch (err) {
        throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getNumberReferralCode() {
    try {
      return await this.randomReferralCodeRepositoryService.countDataByCondition({})
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  
  async deleteMany(lstRandomReferralCode) {
    try {
      const query = {
        $and: [
          { referral_code: { $in: lstRandomReferralCode} }
        ]
      }
      return await this.randomReferralCodeRepositoryService.deleteMany(query);
    } catch (err) {
        throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateIsUsedForListData(lstRandomReferralCode) {
    try {
      const query = {
        $and: [
          { referral_code: { $in: lstRandomReferralCode} }
        ]
      }

      const payload = {
        is_used: false
      }

      await this.randomReferralCodeRepositoryService.updateMany(query, payload)
      return true
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getAndUpdateReferralCode() {
    try {
      const query = {
        $and: [
          { is_used: false }
        ]
      }
      const getItem = await this.randomReferralCodeRepositoryService.findOne(query)

      // Cap nhat is_used = true
      getItem.is_used = true
      await this.randomReferralCodeRepositoryService.findByIdAndUpdate(getItem._id, getItem)

      return { referral_code: getItem.referral_code }
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
