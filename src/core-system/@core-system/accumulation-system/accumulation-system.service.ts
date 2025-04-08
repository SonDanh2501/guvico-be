import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { AccumulationOopSystemService } from 'src/core-system/@oop-system/accumulation-oop-system/accumulation-oop-system.service'
import { CollaboratorOopSystemService } from 'src/core-system/@oop-system/collaborator-oop-system/collaborator-oop-system.service'
import { HistoryActivityOopSystemService } from 'src/core-system/@oop-system/history-activity-oop-system/history-activity-oop-system.service'
import { PunishTicketOopSystemService } from 'src/core-system/@oop-system/punish-ticket-oop-system/punish-ticket-oop-system.service'
import { RewardTicketOopSystemService } from 'src/core-system/@oop-system/reward-ticket-oop-system/reward-ticket-oop-system.service'

@Injectable()
export class AccumulationSystemService {
  constructor(
    private accumulationOopSystemService: AccumulationOopSystemService,
    private collaboratorOopSystemService: CollaboratorOopSystemService,
    private historyActivityOopSystemService: HistoryActivityOopSystemService,
    private punishTicketOopSystemService: PunishTicketOopSystemService,
    private rewardTicketOopSystemService: RewardTicketOopSystemService,
  ) {}

  async summarizeAccumulation() {
    try {
      const yesterday = new Date(new Date().setDate(new Date().getDate() - 1))
      const year = yesterday.getFullYear()
      const month = yesterday.getMonth()
      const date = yesterday.getDate()
      const startTime = new Date(yesterday.setHours(0, 0, 0, 0)).toISOString()
      const endTime = new Date(yesterday.setHours(23, 59, 59, 999)).toISOString()

      const getListCollaborator = await this.collaboratorOopSystemService.getListActivedCollaborator()
      const lstPayloadCreate:any = []

      for(let i = 0; i < getListCollaborator.length; i++) {
        const lstPointRewardTicket = await this.rewardTicketOopSystemService.getRewardTicketByTimeFrame(getListCollaborator[i]._id, startTime, endTime)
        const lstPunishTicket = await this.punishTicketOopSystemService.getPunishTicketByTimeFrame(getListCollaborator[i]._id, startTime, endTime)

        const item:any = {}
        item.id_collaborator = getListCollaborator[i]._id
        item.year = year
        item.month = month
        item.day = date
        item.start_time = startTime
        item.end_time = endTime
        item.reward_point = 0
        item.number_of_violation = lstPunishTicket.length
        item.list_of_violation = []
        for(let j = 0; j < lstPointRewardTicket.length; j++) {
          item.reward_point += lstPointRewardTicket[j].reward_value
        }

        for(let j = 0; j < lstPunishTicket.length; j++) {
          const findIndex = item.list_of_violation.findIndex((e) => e.id_push_policy.toString() === lstPunishTicket[j].id_punish_policy.toString())
          if(findIndex > -1) {
            item.list_of_violation[findIndex].amount += 1
          } else {
            item.list_of_violation.push({
              id_push_policy: lstPunishTicket[j].id_push_policy,
              amount: 1
            })
          }
        }

        lstPayloadCreate.push(item)
      }

      return await this.accumulationOopSystemService.createManyItem(lstPayloadCreate)
    } catch(err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  }
  
  async getAccumulateByCollaboratorAndTimeFrame(idCollaborator, startTime, endTime) {
    try {
      return await this.accumulationOopSystemService.getAccumulateByCollaboratorAndTimeFrame(idCollaborator, startTime, endTime)
    } catch(err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  }
}
