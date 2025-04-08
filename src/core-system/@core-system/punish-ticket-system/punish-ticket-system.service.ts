import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { PUNISH_LOCK_TIME_TYPE, PUNISH_POLICY_TYPE, TICKET_STATUS } from 'src/@repositories/module/mongodb/@database/enum'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service'
import { CollaboratorOopSystemService } from 'src/core-system/@oop-system/collaborator-oop-system/collaborator-oop-system.service'
import { ContentHistoryActivityOopSystemService } from 'src/core-system/@oop-system/content-history-activity-oop-system/content-history-activity-oop-system.service'
import { ContentNotificationOopSystemService } from 'src/core-system/@oop-system/content-notification-oop-system/content-notification-oop-system.service'
import { HistoryActivityOopSystemService } from 'src/core-system/@oop-system/history-activity-oop-system/history-activity-oop-system.service'
import { OrderOopSystemService } from 'src/core-system/@oop-system/order-oop-system/order-oop-system.service'
import { PunishPolicyOopSystemService } from 'src/core-system/@oop-system/punish-policy-oop-system/punish-policy-oop-system.service'
import { PunishTicketOopSystemService } from 'src/core-system/@oop-system/punish-ticket-oop-system/punish-ticket-oop-system.service'
import { UserSystemOoopSystemService } from 'src/core-system/@oop-system/user-system-ooop-system/user-system-ooop-system.service'
import { NotificationSystemService } from '../notification-system/notification-system.service'

@Injectable()
export class PunishTicketSystemService {
    constructor (
        private customExceptionService: CustomExceptionService,
        private generalHandleService: GeneralHandleService,

        private punishTicketOopSystemService: PunishTicketOopSystemService,
        private punishPolicyOopSystemService: PunishPolicyOopSystemService,
        private collaboratorOopSystemService: CollaboratorOopSystemService,
        private historyActivityOopSystemService: HistoryActivityOopSystemService,
        private userSystemOoopSystemService: UserSystemOoopSystemService,
        private notificationSystemService: NotificationSystemService,
        private contentNotificationOopSystemService: ContentNotificationOopSystemService,
        private contentHistoryActivityOopSystemService: ContentHistoryActivityOopSystemService,
        private orderOopSystemService: OrderOopSystemService,

    ) {}


    // revoke chi co duy nhat admin su dung
    async revokePunishTicket(lang, subjectAction, idPunishTicket) {
        try {
        const payloadDependency = {
            punish_ticket: null,
            collaborator: null,
            admin_action: null
        }
        const getDataPromise = await Promise.all([
            this.userSystemOoopSystemService.getDetailItem(lang, subjectAction._id),
            this.punishTicketOopSystemService.getDetailItem(lang, idPunishTicket)
        ])
        payloadDependency.admin_action = getDataPromise[0]
        const getPunishTicket = getDataPromise[1]
            
        if(getPunishTicket.punish_money > 0) {
        const collaborator = await this.collaboratorOopSystemService.getDetailItem(lang, getPunishTicket.id_collaborator)
            const previousBalance = {
                work_wallet: collaborator.work_wallet,
                collaborator_wallet: collaborator.collaborator_wallet
            }
            payloadDependency.punish_ticket = await this.punishTicketOopSystemService.doneToRevokePunishTicket(lang, idPunishTicket);
            payloadDependency.collaborator = await this.collaboratorOopSystemService.addPointWallet(lang, getPunishTicket.id_collaborator, getPunishTicket.payment_out, getPunishTicket.punish_money)
            await this.historyActivityOopSystemService.revokePunishMoneyCollaborator(subjectAction, payloadDependency, previousBalance, getPunishTicket.punish_money)
        }
        return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getListItem(lang, iPage) {
        try {
            return await this.punishTicketOopSystemService.getListItem(lang, iPage)
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getTotalPunishTicket(lang, iPage) {
        try {
            return await this.punishTicketOopSystemService.getTotalItem(lang, iPage)
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    async getListByCollaborator(idCollaborator, iPage) {
        try {
            return await this.punishTicketOopSystemService.getListByCollaborator(idCollaborator, iPage)
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    async getPunishRule(idCollaborator, policy) {
        try {
            // 1. Nếu chính sách phạt chỉ có 1 quy định duy nhất thì lấy và trả về phần tử duy nhất đó
            if(policy?.punish_rule && policy.punish_rule.length === 1) {
                return policy.punish_rule[0]
            }

            // 2. Đếm số vé phạt theo chính sách
            const numberOfTicketByPolicy = await this.punishTicketOopSystemService.countItemByPunishPolicyAndCollaborator(idCollaborator, policy)

            // Khi vi phạm chính sách phạt sẽ tính là một lần vi phạm dù chưa tạo ra vé phạt
            // Nên số lần vi phạm = numberOfTicketByPolicy + 1
            const numberOfViolations = numberOfTicketByPolicy + 1

            // 3. Từ số lần vi phạm, ta tìm tương ứng lần vi phạm trong punish_rule của chính sách
            // Nếu tìm không thấy (có nghĩa là indexOf = -1), ta lấy phần tử có số lần vi phạm lớn nhất ra để áp dụng
            // Nếu tìm thấy thì áp dụng quy tắc đó

            let punishRule = policy['punish_rule'][0]
            const indexOfPunishRule = policy['punish_rule'].findIndex((e) => e.nth_time === numberOfViolations)
            if(indexOfPunishRule > -1) {
                punishRule = policy['punish_rule'][indexOfPunishRule]
            } else {
                const maxTimesPunishRule = policy['punish_rule'].reduce((prev, current) => {
                    return (prev.nth_time > current.nth_time) ? prev : current;
                });
                punishRule = maxTimesPunishRule
            }

            return punishRule
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async createPunishTicket(lang, subjectAction, payload) {
        try {
            const payloadDependency = {
                collaborator: null,
                punish_ticket: null,
                order: null,
                punish_policy: null,
                content_notification: null,
                content_history_activity: null,
                punish_rule: null,
            }
            // 1. Lấy thông tin đối tác, chính sách phạt quy tắc phạt
            const [getCollaborator, getPunishPolicy] = await Promise.all([
                this.collaboratorOopSystemService.getDetailItem(lang, payload.id_collaborator),
                this.punishPolicyOopSystemService.getDetailItem(lang, payload.id_punish_policy)
            ])
            if(payload.id_order !== null && payload.id_order !== undefined)  {
                payloadDependency.order = await this.orderOopSystemService.getDetailItem(lang, payload.id_order)
            }
            const getPunishRule = await this.getPunishRule(payload.id_collaborator, getPunishPolicy)
            payloadDependency.punish_rule = getPunishRule
            payloadDependency.collaborator = getCollaborator
            payloadDependency.punish_policy = getPunishPolicy

            // 2. Tạo phiếu phạt
            const punishTicket = await this.punishTicketOopSystemService.createNewItemFromPolicy(lang, subjectAction, payloadDependency, payload, getPunishRule)
            payloadDependency.punish_ticket = punishTicket

            // 3. Ghi log
            await this.historyActivityOopSystemService.createPunishTicket(subjectAction, payloadDependency)

            return payloadDependency
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    async executePunishTicket(lang, subjectAction, payloadDependency) {
        try {
            const getPunishRule = payloadDependency.punish_rule
            let getCollaborator = payloadDependency.collaborator
            let punishTicket = payloadDependency.punish_ticket
            const punishPolicy = payloadDependency.punish_policy

            punishTicket = await this.punishTicketOopSystemService.standbyToWaitingPunishTicket(lang, punishTicket)
            // 1. Lấy nội dung thông báo
            if(getPunishRule?.id_content_notification) {
                let getContentNotification = await this.contentNotificationOopSystemService.getDetailItem(lang, getPunishRule.id_content_notification)
                payloadDependency.content_notification = getContentNotification
            }
            
            let getContentHistoryActivity = await this.contentHistoryActivityOopSystemService.getDetailItem(lang, getPunishRule.id_content_history_activity)
            payloadDependency.content_history_activity = getContentHistoryActivity
            

            punishTicket.status = TICKET_STATUS.doing;
            punishTicket.execution_date = new Date().toISOString()
            punishTicket = await this.punishTicketOopSystemService.updateRewardTicket(lang, punishTicket)
            payloadDependency.reward_ticket = punishTicket

            // 2.Tăng số lượng vi phạm
            if(punishPolicy.punish_policy_type === PUNISH_POLICY_TYPE.punish) {
                getCollaborator.number_of_violation += 1
                getCollaborator.monthly_number_of_violation += 1
            }

            // Bật cờ không nhận thưởng khi vi phạm chính sách có mức độ là 3
            if(!getCollaborator.is_not_received_reward) {
                if(punishPolicy.severity_level === 3) {
                    getCollaborator.is_not_received_reward = true
                }
            }

            // 3. Cập nhật đối tác, ghi log và thông báo
            if(getPunishRule.punish_value === 0) {
                if(getPunishRule.punish_lock_time_type !== PUNISH_LOCK_TIME_TYPE.unset) {
                    getCollaborator.status = 'locked'
                    getCollaborator.punish_start_time = punishTicket.time_start
                    getCollaborator.punish_end_time = punishTicket.time_end
                }

                await this.collaboratorOopSystemService.updateCollaborator(lang, getCollaborator)
                payloadDependency.collaborator = getCollaborator
                await this.historyActivityOopSystemService.logViolation(subjectAction, payloadDependency, getContentHistoryActivity)
                if(payloadDependency?.content_notification) {
                    await this.notificationSystemService.fineCollaborator(lang, payloadDependency?.content_notification, getCollaborator)
                }
            } else {
                const previousBalance = {
                    work_wallet: getCollaborator.work_wallet,
                    collaborator_wallet: getCollaborator.collaborator_wallet,
                }

                getCollaborator[punishTicket.payment_out] -= punishTicket.punish_money
                payloadDependency.collaborator = getCollaborator
                await this.historyActivityOopSystemService.logViolationAndFine(subjectAction, payloadDependency, getContentHistoryActivity, previousBalance)
                if(payloadDependency?.content_notification) {
                    await this.notificationSystemService.fineCollaboratorWithMoney(lang, payloadDependency?.content_notification, punishTicket.punish_money, getCollaborator)
                }
            }

            return await this.punishTicketOopSystemService.doingToDonePunishTicket(lang, punishTicket._id)
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async createPunishTicketWithPunishMilestone(lang, subjectAction, payloadDependency, payload) {
        try {

            // 1. Lấy thông tin đối tác, chính sách phạt quy tắc phạt
            const [getCollaborator, getPunishPolicy] = await Promise.all([
                this.collaboratorOopSystemService.getDetailItem(lang, payload.id_collaborator),
                this.punishPolicyOopSystemService.getDetailItem(lang, payload.id_punish_policy)
            ])

            const getPunishRule = await this.getPunishRule(payload.id_collaborator, getPunishPolicy._id)

            // 2. Lấy nội dung thông báo
            let getContentNotification = await this.contentNotificationOopSystemService.getDetailItem(lang, getPunishRule.id_content_notification)

            // 3. Tạo phiếu phạt
            const punishTicket = await this.punishTicketOopSystemService.createNewItemFromPolicy(lang, subjectAction, payloadDependency, payload, getPunishRule)
            payloadDependency['punish_ticket'] = punishTicket
            
            // 4. Ghi log
            await this.historyActivityOopSystemService.logViolation(subjectAction, payloadDependency, getContentNotification)
            await this.notificationSystemService.fineCollaborator(lang, getContentNotification, getCollaborator)

            return true
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // async createPunishTicketFromPolicy(lang, subjectAction, id) {
    //     try {

    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    //     }
    // }
}
