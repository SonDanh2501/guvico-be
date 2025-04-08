import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { ERROR, searchQuery } from 'src/@core'
import { CYCLE_TIME_TYPE, PUNISH_POLICY_TYPE, STATUS, USER_APPLY } from 'src/@repositories/module/mongodb/@database/enum'
import { PunishPolicyRepositoryService } from 'src/@repositories/repository-service/punish-policy-repository/punish-policy-repository.service'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service'

@Injectable()
export class PunishPolicyOopSystemService {
    constructor(
        private customExceptionService: CustomExceptionService,
        private generalHandleService: GeneralHandleService,
        private punishPolicyRepositoryService: PunishPolicyRepositoryService
    ) {}

    async getDetailItem(lang, idItem) {
        try {
            const item = await this.punishPolicyRepositoryService.findOneById(idItem);
            if(!item) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "punish_policy")], HttpStatus.NOT_FOUND)
            return item;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getListPunishMilestone() {
        try {
            const query = {
            $and: [
                { punish_policy_type: PUNISH_POLICY_TYPE.punish_milestone },
                { status: STATUS.doing },
                { is_delete: false },
            ]
            }

            const selectOption = { _id: 1, title: 1, description: 1, punish_rule: 1 }

            return await this.punishPolicyRepositoryService.getListDataByCondition(query, selectOption, { "punish_rule.nth_time": 1 })
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getRuleOfPunishPolicy(policy) {
        try {
            
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async createManyItem(lstPayload) {
        try {
            return await this.punishPolicyRepositoryService.createMany(lstPayload)
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async generateRandomIdViewPunishPolicy() {
        let tempRandomID = await this.generalHandleService.randomIDTransaction(4)
        let checkRandomID = await this.punishPolicyRepositoryService.findOne({ id_view: tempRandomID });
        while (checkRandomID) {
            tempRandomID = await this.generalHandleService.randomIDTransaction(4)
            checkRandomID = await this.punishPolicyRepositoryService.findOne({ id_view: tempRandomID });
        }
        return tempRandomID;
    }

    async createItem(payload) {
        try {
            const idView = await this.generateRandomIdViewPunishPolicy()
            const payloadCreate = {
                title: payload.title,
                description: payload.description,
                user_apply: payload.user_apply || USER_APPLY.collaborator,
                total_time_process: payload.total_time_process,
                total_order_process: payload.total_order_process,
                punish_money_type: payload.punish_money_type || null,
                punish_money: payload.punish_money || 0,
                action_lock: payload.action_lock || null,
                punish_lock_time: payload.punish_lock_time || 1,
                punish_lock_time_type: payload.punish_lock_time_type || null,
                status: payload.status || STATUS.doing,
                id_view: idView,
                payment_out: payload.payment_out || "none",
                punish_policy_type: payload.punish_policy_type || PUNISH_POLICY_TYPE.punish,
                punish_rule: payload.punish_rule || [],
                cycle_time_type: payload.cycle_time_type || CYCLE_TIME_TYPE.day,
                start_time_cycle: payload.start_time_cycle || null,
                severity_level: payload.severity_level || null,
            }

            return await this.punishPolicyRepositoryService.create(payloadCreate)
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getList(iPage) {
        try {
            const query: any = searchQuery(["title.vi", "title.en", "description.vi", "description.en"], iPage)
            const getList = await this.punishPolicyRepositoryService.getListPaginationDataByCondition(iPage, query, {}, { date_create: -1 },)
            return getList
        } catch (err) {
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
              punish_money_type: payload.punish_money_type || getItem.punish_money_type,
              punish_money: payload.punish_money || getItem.punish_money,
              action_lock: payload.action_lock || getItem.action_lock,
              punish_lock_time: payload.punish_lock_time || getItem.punish_lock_time,
              punish_lock_time_type: payload.punish_lock_time_type || getItem.punish_lock_time_type,
              status: payload.status || getItem.status,
              id_view: getItem.id_view,
              payment_out: payload.payment_out || getItem.payment_out,
              punish_policy_type: payload.punish_policy_type || getItem.punish_policy_type,
              punish_rule: payload.punish_rule || getItem.punish_rule,
              cycle_time_type: payload.cycle_time_type || getItem.cycle_time_type,
              start_time_cycle: payload.start_time_cycle || getItem.start_time_cycle,
          }       

          const result = await this.punishPolicyRepositoryService.findByIdAndUpdate(idItem, payloadUpdate);
          return result;
      } catch (err) {
          throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
}
