import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { iPageNotificationScheduleDTO } from 'src/@core'
import { ERROR } from 'src/@core/constant'
import { NOTIFICATION_SOUND } from 'src/@repositories/module/mongodb/@database/enum/notification.enum'
import { NotificationScheduleRepositoryService } from 'src/@repositories/repository-service/notification-schedule-repository/notification-schedule-repository.service'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service'

@Injectable()
export class NotificationScheduleOopSystemService {
  constructor(
    private customExceptionService: CustomExceptionService,
    private generalHandleService: GeneralHandleService,

    private notificationScheduleRepositoryService: NotificationScheduleRepositoryService,
) {}

    async createItem(payload) {
        try {
            const notificationSchedule =
                await this.notificationScheduleRepositoryService.create({
                    title: payload.title,
                    body: payload.body,
                    image_url: payload.image_url,
                    date_schedule: payload.date_schedule,
                    is_id_customer: payload.is_id_customer || false,
                    id_customer: payload.id_customer || [],
                    is_id_group_customer: payload.is_id_group_customer || false,
                    id_group_customer: payload.id_group_customer || [],
                    is_id_collaborator: payload.is_id_collaborator || false,
                    id_collaborator: payload.id_collaborator || [],
                    date_create: new Date(Date.now()).toISOString(),
                    sound_guvi: payload.sound_guvi || NOTIFICATION_SOUND.soundguvi,
                })
            return notificationSchedule;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getOneItem() {
        try {
            // Tim lap lich thong bao con 30 phut nua la toi thoi gian ban thong bao
            const dateSchedule = new Date(Date.now() + 30 * 60 * 1000).toISOString()
            const query = {
                $and: [
                    { is_created: false },
                    { is_deleted: false },
                    { date_schedule: { $lte: dateSchedule } }
                ]
            }
            const notification = await this.notificationScheduleRepositoryService.findOne(query, {}, { date_create: 1 })

            return notification
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getDetailItem(lang, idItem) {
        try {
            const getItem = await this.notificationScheduleRepositoryService.findOneById(idItem);
            if (!getItem) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "notification_schedule")], HttpStatus.NOT_FOUND)
            }
            return getItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateIsCreated(lang, idNotification) {
        try {
            let notificationSchedule = await this.getDetailItem(lang, idNotification)
            notificationSchedule.is_created = true
            notificationSchedule = await this.notificationScheduleRepositoryService.findByIdAndUpdate(idNotification, notificationSchedule)

            return notificationSchedule
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getList(lang, iPage: iPageNotificationScheduleDTO, status) {
        try {
            const currentDate = new Date();
            let dateScheduleCondition = {};

            if (status === "todo") {
                dateScheduleCondition = { date_schedule: { $gt: currentDate.toISOString() } };
            }
            else if (status === "done") {
                dateScheduleCondition = { date_schedule: { $lt: currentDate.toISOString()} };
            }
            const query = {
                $and: [
                    // { is_created:  iPage.is_created  },
                    dateScheduleCondition
                ],
        
            }
            const sortOption = { date_create: -1 }; // Sắp xếp theo date_created giảm dần (mới nhất)

            const dataResult = await this.notificationScheduleRepositoryService.getListPaginationDataByCondition(iPage, query, {}, sortOption)
            return dataResult;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateIsDelete(lang, idNotification) {
        try {
            let notificationSchedule = await this.getDetailItem(lang, idNotification)
            notificationSchedule = await this.notificationScheduleRepositoryService.findByIdAndSoftDelete(idNotification)

            return notificationSchedule
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateNotificationSchedule(lang, id_notification_schedule, payload) {
        try {
            await this.getDetailItem(lang, id_notification_schedule)
            return await this.notificationScheduleRepositoryService.findByIdAndUpdate(id_notification_schedule, payload)
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}