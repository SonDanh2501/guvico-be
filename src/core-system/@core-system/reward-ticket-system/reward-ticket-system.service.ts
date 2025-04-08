import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { DEPENDENCY_ORDER_VALUE, REWARD_VALUE_TYPE, TICKET_STATUS } from 'src/@repositories/module/mongodb/@database/enum'
import { TYPE_SUBJECT_ACTION } from 'src/@repositories/module/mongodb/@database/enum/base.enum'
import { CollaboratorOopSystemService } from 'src/core-system/@oop-system/collaborator-oop-system/collaborator-oop-system.service'
import { ContentHistoryActivityOopSystemService } from 'src/core-system/@oop-system/content-history-activity-oop-system/content-history-activity-oop-system.service'
import { ContentNotificationOopSystemService } from 'src/core-system/@oop-system/content-notification-oop-system/content-notification-oop-system.service'
import { HistoryActivityOopSystemService } from 'src/core-system/@oop-system/history-activity-oop-system/history-activity-oop-system.service'
import { OrderOopSystemService } from 'src/core-system/@oop-system/order-oop-system/order-oop-system.service'
import { RewardPolicyOopSystemService } from 'src/core-system/@oop-system/reward-policy-oop-system/reward-policy-oop-system.service'
import { RewardTicketOopSystemService } from 'src/core-system/@oop-system/reward-ticket-oop-system/reward-ticket-oop-system.service'
import { UserSystemOoopSystemService } from 'src/core-system/@oop-system/user-system-ooop-system/user-system-ooop-system.service'
import { NotificationSystemService } from '../notification-system/notification-system.service'

@Injectable()
export class RewardTicketSystemService {
  constructor(
    private rewardTicketOopSystemService: RewardTicketOopSystemService,
    private rewardPolicyOopSystemService: RewardPolicyOopSystemService,
    private collaboratorOopSystemService: CollaboratorOopSystemService,
    private contentNotificationOopSystemService: ContentNotificationOopSystemService,
    private contentHistoryActivityOopSystemService: ContentHistoryActivityOopSystemService,
    private historyActivityOopSystemService: HistoryActivityOopSystemService,
    private userSystemOoopSystemService: UserSystemOoopSystemService,
    private orderOopSystemService: OrderOopSystemService,
    private notificationSystemService: NotificationSystemService,

  ) {}

  async getListByCollaborator(idCollaborator, iPage) {
    try {
      return await this.rewardTicketOopSystemService.getListByCollaborator(idCollaborator, iPage)
    } catch(err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createRewardTicket(lang, subjectAction, payload) {
    try {
      const payloadDependency = {
        collaborator: null,
        admin_action: null,
        reward_ticket: null,
        reward_policy: null,
        order: null,
      }

      if (subjectAction.type === TYPE_SUBJECT_ACTION.admin) {
        const getUser = await this.userSystemOoopSystemService.getDetailItem(lang, subjectAction._id)
        payloadDependency.admin_action = getUser
      }

      // 1. Lấy thông tin đối tác
      const [getCollaborator, getRewardPolicy] = await Promise.all([
        this.collaboratorOopSystemService.getDetailItem(lang, payload.id_collaborator),
        this.rewardPolicyOopSystemService.getDetailItem(lang, payload.id_reward_policy),
      ])

      if(payload.id_order !== null && payload.id_order !== undefined)  {
        payloadDependency.order = await this.orderOopSystemService.getDetailItem(lang, payload.id_order)
      }

      payloadDependency.collaborator = getCollaborator
      payloadDependency.reward_policy = getRewardPolicy

      // 3. Tạo phiếu thưởng
      const rewardTicket = await this.rewardTicketOopSystemService.createItemFromPolicy(lang, payloadDependency, payload, getRewardPolicy)
      payloadDependency['reward_ticket'] = rewardTicket

      return payloadDependency
    } catch (err) {
        throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async executeRewardTicket(lang, subjectAction, payloadDependency) {
      try {
        let getCollaborator = payloadDependency.collaborator
        let rewardTicket = payloadDependency.reward_ticket
        const rewardPolicy = payloadDependency.reward_policy
        const getOrder = payloadDependency.order

        rewardTicket = await this.rewardTicketOopSystemService.standbyToWaitingRewardTicket(lang, rewardTicket)
        // 1. Lấy nội dung thông báo
        let [getContentHistoryActivity, getContentNotification, getPreviousTicket] = await Promise.all([
          this.contentHistoryActivityOopSystemService.getDetailItem(lang, rewardPolicy.reward_rule.id_content_history_activity),
          this.contentNotificationOopSystemService.getDetailItem(lang, rewardPolicy.reward_rule.id_content_notification),
          this.rewardTicketOopSystemService.getPreviousTicket(getCollaborator._id)
        ])
        payloadDependency.content_notification = getContentNotification

        rewardTicket.status = TICKET_STATUS.doing;
        rewardTicket.execution_date = new Date().toISOString()
        rewardTicket.updated_time_of_previous_ticket = getPreviousTicket?.execution_date || null
        rewardTicket = await this.rewardTicketOopSystemService.updateRewardTicket(lang, rewardTicket)
        payloadDependency.reward_ticket = rewardTicket

        // 2. Cộng điểm, ghi log và thông báo
        if(rewardPolicy.reward_rule['reward_value_type'] === REWARD_VALUE_TYPE.point) {
          let rewardValue = rewardTicket.reward_value
          const previousBalance = {
            reward_point: getCollaborator.reward_point
          }

          if(rewardPolicy.reward_rule['dependency_order_value'] === DEPENDENCY_ORDER_VALUE.total_estimate) {
            rewardValue = getOrder.total_estimate * rewardTicket.reward_value 
            getCollaborator.reward_point += rewardValue
            getCollaborator.monthly_reward_point += rewardValue
          } else {
            getCollaborator.reward_point += rewardTicket.reward_value
            getCollaborator.monthly_reward_point += rewardTicket.reward_value
          }

          getCollaborator.last_point_updated_at = rewardTicket.execution_date
          getCollaborator.monthly_last_point_updated_at = rewardTicket.execution_date
          await this.collaboratorOopSystemService.updateCollaborator(lang, getCollaborator)
          payloadDependency.collaborator = getCollaborator
          await this.historyActivityOopSystemService.addRewardPoint(subjectAction, payloadDependency, getContentHistoryActivity, rewardValue, previousBalance)
          await this.notificationSystemService.addRewardPoint(lang, getContentNotification, getCollaborator)
        } else {
          const previousBalance = {
              work_wallet: getCollaborator.work_wallet,
              collaborator_wallet: getCollaborator.collaborator_wallet,
          }

          getCollaborator[rewardTicket.type_wallet] += rewardTicket.reward_value 
          payloadDependency.collaborator = getCollaborator
          await this.historyActivityOopSystemService.addRewardMoney(subjectAction, payloadDependency, getContentHistoryActivity, previousBalance)
          await this.notificationSystemService.addRewardMoney(lang, getContentNotification, rewardTicket.reward_value, getCollaborator, rewardPolicy.score)
        }

        await this.rewardTicketOopSystemService.doingToDoneRewardTicket(lang, rewardTicket._id)

        return true
      } catch(err) {
        throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
      }
  }

  async revokeRewardTicket(lang, subjectAction, idRewardTicket) {
    try {
      const payloadDependency = {
        reward_ticket: null,
        collaborator: null,
        admin_action: null
      }
      const [getUser, getRewardTicket, ] = await Promise.all([
        this.userSystemOoopSystemService.getDetailItem(lang, subjectAction._id),
        this.rewardTicketOopSystemService.getDetailItem(lang, idRewardTicket)
      ])
      payloadDependency.admin_action = getUser
      const getCollaborator = await this.collaboratorOopSystemService.getDetailItem(lang, getRewardTicket.id_collaborator)
      // Cập nhật trạng thái của phiếu thưởng
      payloadDependency.reward_ticket = await this.rewardTicketOopSystemService.doneToRevokeRewardTicket(lang, idRewardTicket);

      if((getRewardTicket.reward_value_type === REWARD_VALUE_TYPE.money || getRewardTicket.reward_value_type === REWARD_VALUE_TYPE.percent) && getRewardTicket.reward_value > 0) {
        // Thu hồi tiền, ghi log và thông báo
        const previousBalance = {
          work_wallet: getCollaborator.work_wallet,
          collaborator_wallet: getCollaborator.collaborator_wallet
        }
        payloadDependency.collaborator = await this.collaboratorOopSystemService.minusRewardMoney(lang, getRewardTicket.id_collaborator, getRewardTicket.payment_out, getRewardTicket.reward_value)
        await this.historyActivityOopSystemService.revokeRewardMoneyCollaborator(subjectAction, payloadDependency, previousBalance, getRewardTicket.reward_value)
        await this.notificationSystemService.revokeRewardMoney(lang, getRewardTicket.reward_value, getCollaborator, getRewardTicket.type_wallet)
      } else if(getRewardTicket.reward_value_type === REWARD_VALUE_TYPE.point && getRewardTicket.reward_value > 0) {
        const [getPreviousTicket, getTicketLater] = await Promise.all([
          this.rewardTicketOopSystemService.getPreviousTicket(getCollaborator._id, getRewardTicket.updated_time_of_previous_ticket),
          this.rewardTicketOopSystemService.getTicketLater(getCollaborator._id, getRewardTicket.execution_date)
        ]) 
        
        // Nếu không có phiếu thưởng sau phiếu thưởng hiện tại thì cập nhật lại ngày cộng điểm của đối tác
        // Nếu có phiếu thưởng sau phiếu thưởng hiện tại thì cập nhật lại ngày cộng điểm của phiếu thưởng sau phiếu thưởng hiện tại
        let lastPointUpdatedAt:any
        if(getTicketLater !== null && getTicketLater !== undefined) {
          getTicketLater.updated_time_of_previous_ticket = getPreviousTicket.execution_date
          await this.rewardTicketOopSystemService.updateRewardTicket(lang, getTicketLater)
        } else {
          lastPointUpdatedAt = getRewardTicket.updated_time_of_previous_ticket
        }

        // Thu hồi điểm
        const previousBalance = {
          reward_point: getCollaborator.reward_point,
        }
        payloadDependency.collaborator = await this.collaboratorOopSystemService.minusRewardPointAndUpdateTime(lang, getRewardTicket.id_collaborator, getRewardTicket.reward_value, lastPointUpdatedAt)
        await this.historyActivityOopSystemService.revokeRewardPointCollaborator(subjectAction, payloadDependency, previousBalance, getRewardTicket.reward_value)
        await this.notificationSystemService.revokeRewardPoint(lang, getRewardTicket.reward_value, getCollaborator)
      }

      return true;
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
