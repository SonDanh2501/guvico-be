import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { ERROR, TEMP_CREATED_AT } from 'src/@core'
import { DEPENDENCY_ORDER_VALUE, REWARD_VALUE_TYPE, TICKET_STATUS } from 'src/@repositories/module/mongodb/@database/enum'
import { RewardTicketRepositoryService } from 'src/@repositories/repository-service/reward-ticket-repository/reward-ticket-repository.service'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service'

@Injectable()
export class RewardTicketOopSystemService {
  constructor(
    private generalHandleService: GeneralHandleService,
    private customExceptionService: CustomExceptionService,
    private rewardTicketRepositoryService: RewardTicketRepositoryService
  ) {}

  async getDetailItem(lang, idItem) {
    try {
      const item = await this.rewardTicketRepositoryService.findOneById(idItem);
      if(!item) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "reward_ticket")], HttpStatus.NOT_FOUND)
      return item;
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  async updateRewardTicket(lang, rewardTicket) {
    try {
      await this.getDetailItem(lang, rewardTicket._id)
      return await this.rewardTicketRepositoryService.findByIdAndUpdate(rewardTicket._id, rewardTicket)
    } catch(err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async generateRandomIdViewRewardTicket() {
    const now = new Date();
    let tempRandomID = await this.generalHandleService.randomIDTransaction(4)
    const day = now.getDay() < 10 ? `0${now.getDay().toString()}` : now.getDay().toString();
    const month = now.getMonth() < 10 ? `0${now.getMonth().toString()}` : now.getMonth().toString();
    const year = now.getFullYear().toString()
    let idView = `#` + year + month + day + tempRandomID;
    let checkRandomID = await this.rewardTicketRepositoryService.findOne({ id_view: idView });
    let a = 0;
    while (checkRandomID && a < 5) {
      tempRandomID = await this.generalHandleService.randomIDTransaction(4)
      idView = `#` + year + month + day + tempRandomID;
      checkRandomID = await this.rewardTicketRepositoryService.findOne({ id_view: idView });
      a += 1;
    }
    return idView;
}

  async calculateRewardValue(policy, order?) {
    try {
      let rewardValue = policy.reward_rule.reward_value;
      if (policy.reward_rule['reward_value_type'] === REWARD_VALUE_TYPE.percent) {
        if (order) {
          switch(policy.reward_rule['dependency_order_value']) {
            case DEPENDENCY_ORDER_VALUE.initial_fee : {
              let initialFee = order.initial_fee / 1000;
              rewardValue = Number((initialFee * (policy.reward_value / 100)).toFixed()) * 1000;
              break;
            }
            case DEPENDENCY_ORDER_VALUE.final_fee : {
              let finalFee = order.final_fee / 1000;
              rewardValue = Number((finalFee * (policy.reward_value / 100)).toFixed()) * 1000;
              break;
            }
            case DEPENDENCY_ORDER_VALUE.subtotal_fee : {
              let subtotalFee = order.subtotal_fee / 1000;
              rewardValue = Number((subtotalFee * (policy.reward_value / 100)).toFixed()) * 1000;
              break;
            }
            default: {
              break;
          }
          }
        }
      } 
      return rewardValue;
    } catch (err) {
        throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createItemFromPolicy(lang, payloadDependency, payload, policy) {
    try {
        const rewardValue = await this.calculateRewardValue(policy, payloadDependency.order)
        const newPayload = {
          title: policy.title,
          user_apply: policy.user_apply,
          id_collaborator: payload.id_collaborator || null,
          id_customer: payload.id_customer || null,
          current_total_time_process: 1,
          current_total_order_process: 1,
          id_reward_policy: policy._id,
          reward_policy_type: policy.reward_policy_type,
          reward_value_type: policy.reward_value_type,
          reward_value: rewardValue,
          id_order: payloadDependency?.order?._id || null,
          type_wallet: policy.reward_wallet_type,
          status: TICKET_STATUS.standby
        }
        const newData = await this.createItem(newPayload)
        return newData;
    } catch (err) {
        throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createItem(payload) {
    try {
        const idView = await this.generateRandomIdViewRewardTicket()

        const payloadCreate = {
          title: payload.title,
          user_apply: payload.user_apply,
          id_collaborator: payload.id_collaborator || null,
          id_customer: payload.id_customer || null,
          created_at: new Date(Date.now()).toISOString(),
          current_total_time_process: 1,
          current_total_order_process: 1,
          status: "standby",
          id_reward_policy: payload.id_reward_policy,
          reward_value_type: payload.reward_value_type,
          reward_value: payload.reward_value,
          id_order: payload.id_order || null,
          id_view: idView,
          type_wallet: payload.type_wallet || null,
        }
        const newData = await this.rewardTicketRepositoryService.create(payloadCreate)
        return newData;
    } catch (err) {
        throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createManyItem(lstPayload) {
    try {
        return await this.rewardTicketRepositoryService.createMany(lstPayload)
    } catch (err) {
        throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getListByCollaborator(idCollaborator, iPage) {
    try {            
      const query:any = {
        $and:[
          { id_collaborator: idCollaborator },
        ]
      }
      if(iPage.date_type === 'week') {
        const getWeekRange = await this.generalHandleService.getWeekRange(new Date(), 1, 'Asia/Ho_Chi_Minh')

        query.$and.push(
            { date_create: { $gte: getWeekRange.startOfWeek.toISOString(), $lte: getWeekRange.endOfWeek.toISOString() } }
        )
      } 
      return await this.rewardTicketRepositoryService.getListPaginationDataByCondition(iPage, query, {}, { date_create: -1 })
    } catch(err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async standbyToWaitingRewardTicket(lang, rewardTicket) {
    try {
        if (rewardTicket.status !== TICKET_STATUS.standby) {
          throw new HttpException([await this.customExceptionService.i18nError(ERROR.DO_NOT_CHANGE_STATUS, lang, null)], HttpStatus.FORBIDDEN);
        }
        rewardTicket.status = TICKET_STATUS.waiting;
        const result = await this.rewardTicketRepositoryService.findByIdAndUpdate(rewardTicket._id, rewardTicket);
        return result;
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  }

  async doneToRevokeRewardTicket(lang, idRewardTicket) {
    try {
      const rewardTicket = await this.getDetailItem(lang, idRewardTicket)
      if(rewardTicket.status === TICKET_STATUS.revoke) {
          throw new HttpException([await this.customExceptionService.i18nError(ERROR.REWARD_TICKET.IS_REVOKE, lang, "reward_ticket")], HttpStatus.NOT_FOUND)
      }
      if(rewardTicket.status === TICKET_STATUS.cancel) {
          throw new HttpException([await this.customExceptionService.i18nError(ERROR.REWARD_TICKET.IS_CANCEL, lang, "reward_ticket")], HttpStatus.NOT_FOUND)
      }
      rewardTicket.status = TICKET_STATUS.revoke;
      rewardTicket.revocation_date = new Date().toISOString()
      return await this.rewardTicketRepositoryService.findByIdAndUpdate(rewardTicket._id, rewardTicket);
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  async getPreviousTicket(idCollaborator, time?) {
    try {
      const getWeekRange = await this.generalHandleService.getWeekRange(new Date(), 1, 'Asia/Ho_Chi_Minh')
      const queryGetPreviousTicket = {
        $and: [
          { reward_value_type: REWARD_VALUE_TYPE.point },
          { status: TICKET_STATUS.done },
          { date_create: { $gte: getWeekRange.startOfWeek.toISOString() } },
          { execution_date: { $lte: time } },
          { id_collaborator: idCollaborator }
        ]
      }
      if(time === null || time === undefined) {
        queryGetPreviousTicket.$and.splice(3, 1)
      }

      return await this.rewardTicketRepositoryService.findOne(queryGetPreviousTicket, {}, { execution_date: -1 })
    } catch(err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  async getTicketLater(idCollaborator, time) {
    try {
      const query = {
        $and: [
          { reward_value_type: REWARD_VALUE_TYPE.point },
          { status: TICKET_STATUS.done },
          { updated_time_of_previous_ticket: { $eq: time } },
          { id_collaborator: idCollaborator }
        ]
      }

      return await this.rewardTicketRepositoryService.findOne(query, {}, { execution_date: 1 })
    } catch(err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getRewardTicketByTimeFrame(idCollaborator, startTime, endTime) {
    try {
      const query = {
        $and: [
          { reward_value_type: REWARD_VALUE_TYPE.point },
          { status: TICKET_STATUS.done },
          { date_create: { $gte: startTime, $lte: endTime } },
          { id_collaborator: idCollaborator }
        ]
      }

      return await this.rewardTicketRepositoryService.getListDataByCondition(query, {}, { execution_date: 1 })
    } catch(err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async doingToDoneRewardTicket(lang, idRewardTicket) {
    try {
        const rewardTicket = await this.getDetailItem(lang, idRewardTicket)
        rewardTicket.status = TICKET_STATUS.done;
        const result = await this.rewardTicketRepositoryService.findByIdAndUpdate(rewardTicket._id, rewardTicket);
        return result;
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getTotalRewardMoneyByIdCollaborator(idCollaborator) {
    try {
      const query:any = {
        $and: [
          { user_apply: "collaborator" },
          { reward_value_type: { $in: [REWARD_VALUE_TYPE.money, REWARD_VALUE_TYPE.percent] } },
          { status: TICKET_STATUS.done },
          { id_collaborator: idCollaborator }
        ]
      }

      const queryAggregate = [
        {
          $match: query
        },
        {
          $group: {
            _id: {},
            total_reward_money: { $sum: "$reward_value" }
          }
        }
      ]

      const getData =  await this.rewardTicketRepositoryService.aggregateQuery(queryAggregate)

      return { total_reward_money: getData.length > 0 ? getData[0].total_reward_money : 0 }
    } catch(err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  } 

  async getTotalRewardMoneyByIdCollaboratorAndTimeFrame(idCollaborator, group, startDate, endDate) {
    try {
      const query:any = {
        $and: [
          { user_apply: "collaborator" },
          { reward_value_type: { $in: [REWARD_VALUE_TYPE.money, REWARD_VALUE_TYPE.percent] } },
          { status: TICKET_STATUS.done },
          { id_collaborator: idCollaborator },
          { created_at: { $gte: startDate, $lte: endDate } }
        ]
      }

      const groupDays = (group === "days") ? { "$dateToString": { "format": "%d/%m/%Y", "date": "$tempDate" } } : { "$dateToString": { "format": "%m/%Y", "date": "$tempDate" } }

      const queryAggregate = [
        { $match: query }, 
        { $addFields: TEMP_CREATED_AT },
        {
          $group: {
            _id: groupDays,
            total_reward_money: { $sum: "$reward_value" }
          }
        },
        { $sort: { _id: -1 } }
      ]

      const getData = await this.rewardTicketRepositoryService.aggregateQuery(queryAggregate)

      return (getData.length > 0) ? getData[0] : null;
    } catch(err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  } 
}
