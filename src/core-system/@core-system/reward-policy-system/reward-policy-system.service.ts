import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { iPageDTO } from 'src/@core'
import { TYPE_SUBJECT_ACTION } from 'src/@repositories/module/mongodb/@database/enum/base.enum'
import { HistoryActivityOopSystemService } from 'src/core-system/@oop-system/history-activity-oop-system/history-activity-oop-system.service'
import { RewardPolicyOopSystemService } from 'src/core-system/@oop-system/reward-policy-oop-system/reward-policy-oop-system.service'
import { UserSystemOoopSystemService } from 'src/core-system/@oop-system/user-system-ooop-system/user-system-ooop-system.service'

@Injectable()
export class RewardPolicySystemService {
  constructor(
    private rewardPolicyOopSystemService: RewardPolicyOopSystemService,
    private historyActivityOopSystemService: HistoryActivityOopSystemService,
    private userSystemOoopSystemService: UserSystemOoopSystemService,
  ) {

  }
  async createNewItem(lang, subjectAction, payload) {
    try {
      const payloadDependency = {
        reward_policy: null,
        admin_action: null,
      }

      if(subjectAction.type === TYPE_SUBJECT_ACTION.admin) {
        payloadDependency.admin_action = await this.userSystemOoopSystemService.getDetailItem(lang, subjectAction._id)
      }

      payloadDependency.reward_policy = await this.rewardPolicyOopSystemService.createItem(payload)
      await this.historyActivityOopSystemService.createRewardPolicy(subjectAction, payloadDependency)

      return true
    } catch(err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  async getListItem(lang, iPage: iPageDTO) {
    try {
      return await this.rewardPolicyOopSystemService.getList(iPage)
    } catch(err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getDetailItem(lang, idItem) {
    try {
        return this.rewardPolicyOopSystemService.getDetailItem(lang, idItem)
    } catch (err) {
        throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateItem(lang, subjectAction, idItem, payload) {
    try {
      const payloadDependency = {
        reward_policy: null,
        admin_action: null,
      }
      if(subjectAction.type === TYPE_SUBJECT_ACTION.admin) {
        payloadDependency.admin_action = await this.userSystemOoopSystemService.getDetailItem(lang, subjectAction._id)
      }
      payloadDependency.reward_policy = await this.rewardPolicyOopSystemService.updateItem(lang, idItem, payload)
      await this.historyActivityOopSystemService.updateRewardPolicy(subjectAction, payloadDependency)
    } catch (err) {
        throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

}

  
