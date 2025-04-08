import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { ERROR } from 'src/@core'
import { CYCLE_TIME_TYPE, REWARD_POLICY_TYPE, REWARD_WALLET_TYPE, STATUS, USER_APPLY } from 'src/@repositories/module/mongodb/@database/enum'
import { RewardPolicyRepositoryService } from 'src/@repositories/repository-service/reward-policy-repository/reward-policy-repository.service'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service'

@Injectable()
export class RewardPolicyOopSystemService {

  constructor(
    private customExceptionService: CustomExceptionService,
    private generalHandleService: GeneralHandleService,
    private rewardPolicyRepositoryService: RewardPolicyRepositoryService
  ) { }
  
    async getDetailItem(lang, idItem) {
      try {
          const item = await this.rewardPolicyRepositoryService.findOneById(idItem);
          if(!item) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "reward_ticket")], HttpStatus.NOT_FOUND)
          return item;
      } catch (err) {
          throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

  async generateRandomIdViewRewardPolicy() {
    let tempRandomID = await this.generalHandleService.randomIDTransaction(4)
    let checkRandomID = await this.rewardPolicyRepositoryService.findOne({ id_view: tempRandomID });
    while (checkRandomID) {
        tempRandomID = await this.generalHandleService.randomIDTransaction(4)
        checkRandomID = await this.rewardPolicyRepositoryService.findOne({ id_view: tempRandomID });
    }
    return tempRandomID;
  }

    async createItem(payload) {
        try {
            const idView = await this.generateRandomIdViewRewardPolicy()
            const payloadCreate = {
                title: payload.title,
                description: payload.description,
                user_apply: payload.user_apply || USER_APPLY.collaborator,
                total_time_process: payload.total_time_process,
                total_order_process: payload.total_order_process,
                status: payload.status || STATUS.doing,
                id_view: idView,
                reward_policy_type: payload.reward_policy_type || REWARD_POLICY_TYPE.reward,
                reward_wallet_type: payload.reward_wallet_type || REWARD_WALLET_TYPE.none,
                score: payload.score || 0,
                reward_rule: payload.reward_rule || {},
                cycle_time_type: payload.cycle_time_type || CYCLE_TIME_TYPE.day,
                start_time_cycle: payload.start_time_cycle || null,
                created_at: new Date().toISOString()
            }

            return await this.rewardPolicyRepositoryService.create(payloadCreate)
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async createManyItem(lstPayload) {
      try {
          return await this.rewardPolicyRepositoryService.createMany(lstPayload)
      } catch (err) {
          throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
      }
  }

    async getList(iPage) {
        try {
            const query = {
                $and: [
                    { is_delete: false },
                ]
            }
            const getList = await this.rewardPolicyRepositoryService.getListPaginationDataByCondition(iPage, query, {}, { created_at: -1 },)

            return getList
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
  
  async getListRewardMilestone() {
    try {
      const query = {
        $and: [
          { reward_policy_type: REWARD_POLICY_TYPE.reward_milestone },
          { status: STATUS.doing },
          { is_delete: false },
        ]
      }

      const selectOption = { _id: 1, title: 1, description: 1, score: 1 }

      return await this.rewardPolicyRepositoryService.getListDataByCondition(query, selectOption, { score: 1 })
    } catch(err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

    async updateItem(lang, idItem, payload) {
      try {
          const getItem = await this.getDetailItem(lang, idItem)   
          const payloadUpdate = {
              title: payload.title || getItem.title,
              description: payload.description || getItem.description,
              user_apply: payload.user_apply || getItem.user_apply,
              total_time_process: payload.total_time_process || getItem.total_time_process,
              total_order_process: payload.total_order_process || getItem.total_order_process,
              status: payload.status || getItem.status,
              id_view: getItem.id_view,
              reward_policy_type: payload.reward_policy_type || getItem.reward_policy_type,
              reward_wallet_type: payload.reward_wallet_type || getItem.reward_wallet_type,
              score: payload.score || getItem.score,
              reward_rule: payload.reward_rule || getItem.reward_rule,
              cycle_time_type: payload.cycle_time_type || getItem.cycle_time_type,
              start_time_cycle: payload.start_time_cycle || getItem.start_time_cycle,
              created_at: getItem.created_at
          }       

          const result = await this.rewardPolicyRepositoryService.findByIdAndUpdate(idItem, payloadUpdate);
          return result;
      } catch (err) {
          throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
}
