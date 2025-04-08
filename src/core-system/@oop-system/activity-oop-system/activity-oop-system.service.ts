import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { Types } from 'mongoose'
import { TYPE_SUBJECT_ACTION } from 'src/@repositories/module/mongodb/@database/enum/base.enum'
import { HistoryActivityRepositoryService } from 'src/@repositories/repository-service/history-activity-repository/history-activity-repository.service'
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service'
import { createHistoryActivityDTO } from 'src/@core/dto/historyActivity.dto';
@Injectable()
export class ActivityOopSystemService {
    constructor(
        private historyActivityRepositoryService: HistoryActivityRepositoryService,
    ) { }
    async createItem(payload: createHistoryActivityDTO) {
        try {
            const dataCreate: createHistoryActivityDTO = {
                id_admin_action: payload.id_admin_action,
                id_user_system: payload.id_user_system,
                id_customer: payload.id_customer,
                id_examtest: payload.id_examtest,
                id_collaborator: payload.id_collaborator,
                id_punish: payload.id_punish,
                id_collaborator_bonus: payload.id_collaborator_bonus,
                id_reward: payload.id_reward,
                id_question: payload.id_question,
                id_info: payload.id_info,
                id_info_reward_collaborator: payload.id_info_reward_collaborator,
                id_punish_ticket: payload.id_punish_ticket,
                title_admin: payload.title_admin,
                title: payload.title,
                body: payload.body,
                type: payload.type,
                date_create: new Date(Date.now()).toISOString(),
                id_order: payload.id_order,
                id_group_order: payload.id_group_order,
                id_promotion: payload.id_promotion,
                id_feedback: payload.id_feedback,
                id_transaction: payload.id_transaction,
                id_code: payload.id_code,
                id_inviter: payload.id_inviter,
                id_banner: payload.id_banner,
                id_address: payload.id_address,
                id_extend_optional: payload.id_extend_optional,
                id_feed_back: payload.id_feed_back,
                id_group_customer: payload.id_group_customer,
                id_group_promotion: payload.id_group_promotion,
                id_group_service: payload.id_group_service,
                id_news: payload.id_news,
                id_optional_service: payload.id_optional_service,
                id_push_notification: payload.id_push_notification,
                id_reason_cancel: payload.id_reason_cancel,
                id_reason_punish: payload.id_reason_punish,
                id_service: payload.id_service,
                id_customer_request: payload.id_customer_request,
                value: payload.value,
                value_string: payload.value_string,
                value_select: payload.value_select,
                id_transistion_point: payload.id_transistion_point,
                id_training_lesson: payload.id_training_lesson,
                id_business: payload.id_business,
                current_pay_point: payload.current_point,
                status_current_pay_point: payload.status_current_point,
                current_reputation_score: payload.current_reputation_score,
                current_work_wallet: payload.current_work_wallet,
                status_current_work_wallet: payload.status_current_work_wallet,
                current_collaborator_wallet: payload.current_collaborator_wallet,
                status_current_collaborator_wallet: payload.status_current_collaborator_wallet,
                status_current_point: payload.status_current_point,
                current_point: payload.current_point,
            }
            const newItem = await this.historyActivityRepositoryService.create(dataCreate);
            return newItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    async createTransaction(transaction) {
        try {
            const message = {
                vi: `Tạo giao dịch ${transaction.id_view} thành công`,
                en: `Create transaction ${transaction.id_view} success`
            }
            const payload = {
                id_transaction: transaction._id,
                id_collaborator: transaction.id_collaborator,
                id_customer: transaction.id_customer,
                id_punish_ticket: transaction.id_punish_ticket,
                id_order: transaction.id_order,
                id_admin_action: transaction.id_admin_action,
                title: message,
                body: message,
                title_admin: message.vi,
                type: "create_transaction",
            }
            await this.createItem(payload);

        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }
    async createLink(transaction) {
        try {
            const message = {
                vi: `Tạo giao dịch ${transaction.id_view} thành công`,
                en: `Create transaction ${transaction.id_view} success`
            }
            const payload = {
                id_transaction: transaction._id,
                id_collaborator: transaction.id_collaborator,
                id_customer: transaction.id_customer,
                id_punish_ticket: transaction.id_punish_ticket,
                id_order: transaction.id_order,
                id_admin_action: transaction.id_admin_action,
                title: message,
                body: message,
                title_admin: message.vi,
                type: "create_transaction",
            }
            await this.createItem(payload);

        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }
    async createTrainingLesson(trainingLesson, admin) {
        try {
            const message = {
                en: 'Admin create training lesson successfully',
                vi: 'Quản trị viên đã tạo thành công bài kiểm tra thành công',
            }
            const temp = `${admin?._id} đã tạo mới bài kiểm tra ${trainingLesson?.id} thành công`;
            const payload = {
                id_admin_action: admin?._id,
                id_training_lesson: trainingLesson?.id,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_create_training_lesson',

            }
            await this.createItem(payload);

        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }


}