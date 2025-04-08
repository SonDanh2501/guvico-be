import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { ERROR, iPageNotificationScheduleDTO } from 'src/@core'
import { TYPE_SUBJECT_ACTION } from 'src/@repositories/module/mongodb/@database/enum/base.enum'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
import { HistoryActivityOopSystemService } from 'src/core-system/@oop-system/history-activity-oop-system/history-activity-oop-system.service'
import { NotificationScheduleOopSystemService } from 'src/core-system/@oop-system/notification-schedule-oop-system/notification-schedule-oop-system.service'
import { UserSystemOoopSystemService } from 'src/core-system/@oop-system/user-system-ooop-system/user-system-ooop-system.service'

@Injectable()
export class NotificationScheduleSystemService {
  constructor(
    private customExceptionService: CustomExceptionService,
    private notificationScheduleOopSystemService: NotificationScheduleOopSystemService,
    private userSystemOoopSystemService: UserSystemOoopSystemService,
    private historyActivityOopSystemService: HistoryActivityOopSystemService
  ) {

  }

  async createNotificationSchdule(lang, payload, subjectAction) {
    try {
      const payloadDependency = {
        admin_action: null,
        notification_schedule: null
      }

      if (subjectAction.type === TYPE_SUBJECT_ACTION.admin) {
        const getUser = await this.userSystemOoopSystemService.getDetailItem(lang, subjectAction._id)
        payloadDependency.admin_action = getUser
      }

      payloadDependency.notification_schedule = await this.notificationScheduleOopSystemService.createItem(payload);

      await this.historyActivityOopSystemService.createNotificationSchedule(subjectAction, payloadDependency)

      return true
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getDetailItem(lang, idItem) {
    try {
        const getItem = await this.notificationScheduleOopSystemService.getDetailItem(lang, idItem);
        return getItem;
    } catch (err) {
        throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  }

  async getOneItem() {
    try {
      return await this.notificationScheduleOopSystemService.getOneItem()
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateIsCreated(lang, idNoticationSchedule) {
    try {
      const payloadDependency = {
        notification_schedule: null
      }

      payloadDependency.notification_schedule = await this.notificationScheduleOopSystemService.updateIsCreated(lang, idNoticationSchedule)
      await this.historyActivityOopSystemService.updateIsCreatedNotificationSchedule({}, payloadDependency)

      return true
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getListItem(lang, iPage: iPageNotificationScheduleDTO, status) {
    try {
      return await this.notificationScheduleOopSystemService.getList(lang, iPage, status)
    } catch (err) {
        throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  }

  async updateIsDelete(lang, idItem, subjectAction) {
    try {
      const payloadDependency = {
        admin_action: null,
        notification_schedule: null
      }

      if (subjectAction.type === TYPE_SUBJECT_ACTION.admin) {
        const getUser = await this.userSystemOoopSystemService.getDetailItem(lang, subjectAction._id)
        payloadDependency.admin_action = getUser
      }

      let getNotificationSchedule = await this.notificationScheduleOopSystemService.getDetailItem(lang, idItem)

      // Kiem tra con bao nhieu phut nua la toi gio ban thong bao
      // Neu thoi gian con lai nho hon hoac bang 30 phut thi khong co phep chinh sua
      const remainingTime = (new Date(getNotificationSchedule.date_schedule).getTime() - Date.now()) / (1000 * 60)
      if(remainingTime <= 30) {
        throw new HttpException([await this.customExceptionService.i18nError(ERROR.OVERTIME_UPDATE, lang, "notification_schedule")], HttpStatus.NOT_FOUND)
      }

      payloadDependency.notification_schedule = await this.notificationScheduleOopSystemService.updateIsDelete(lang, idItem)

      await this.historyActivityOopSystemService.updateIsDeleteNotificationSchedule(subjectAction, payloadDependency)

      return true
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  }

  async updateNotificationSchedule(lang, subjectAction, idNotificationSchedule, payload) {
    try {
      const payloadDependency = {
        notification_schedule: null,
        admin_action: null
      }

      if (subjectAction.type === TYPE_SUBJECT_ACTION.admin) {
        const getUser = await this.userSystemOoopSystemService.getDetailItem(lang, subjectAction._id)
        payloadDependency.admin_action = getUser
      }

      let getNotificationSchedule = await this.notificationScheduleOopSystemService.getDetailItem(lang, idNotificationSchedule)

      // Kiem tra con bao nhieu phut nua la toi gio ban thong bao
      // Neu thoi gian con lai nho hon hoac bang 30 phut thi khong co phep chinh sua
      const remainingTime = (new Date(getNotificationSchedule.date_schedule).getTime() - Date.now()) / (1000 * 60)
      if(remainingTime <= 30) {
        throw new HttpException([await this.customExceptionService.i18nError(ERROR.OVERTIME_UPDATE, lang, "notification_schedule")], HttpStatus.NOT_FOUND)
      }

      const notificationScheduleUpate = {
        title: payload.title || getNotificationSchedule.title,
        body: payload.body || getNotificationSchedule.body,
        image_url: payload.image_url || getNotificationSchedule.image_url,
        date_schedule: payload.date_schedule || getNotificationSchedule.date_schedule,
        is_id_customer: payload.is_id_customer || getNotificationSchedule.is_id_customer,
        id_customer: payload.id_customer || getNotificationSchedule.id_customer,
        is_id_group_customer: payload.is_id_group_customer || getNotificationSchedule.is_id_group_customer,
        id_group_customer: payload.id_group_customer || getNotificationSchedule.id_group_customer,
        is_id_collaborator: payload.is_id_collaborator || getNotificationSchedule.is_id_collaborator,
        id_collaborator: payload.id_collaborator || getNotificationSchedule.id_collaborator,
        sound_guvi: payload.sound_guvi || getNotificationSchedule.sound_guvi,
      }

      payloadDependency.notification_schedule =  await this.notificationScheduleOopSystemService.updateNotificationSchedule(lang, getNotificationSchedule._id, notificationScheduleUpate)

      return true
    } catch(err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  }
}
