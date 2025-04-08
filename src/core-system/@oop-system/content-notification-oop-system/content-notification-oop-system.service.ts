import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ERROR } from 'src/@core';
import { USER_APPLY } from 'src/@repositories/module/mongodb/@database/enum';
import { ContentNotificationRepositoryService } from 'src/@repositories/repository-service/content-notification-repository/content-notification-repository.service';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';

@Injectable()
export class ContentNotificationOopSystemService {
  constructor(
    private customExceptionService: CustomExceptionService,
    private contentNotificationRepositoryService: ContentNotificationRepositoryService
  ) { }

  async getDetailItem(lang, idContentNotification) {
    try {
      const getContentNotification = await this.contentNotificationRepositoryService.findOneById(idContentNotification);
      if (!getContentNotification) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "content_notification")], HttpStatus.NOT_FOUND)
      return getContentNotification;
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
        const getList = await this.contentNotificationRepositoryService.getListPaginationDataByCondition(iPage,query, {}, { date_create: -1 },)

        return getList
    } catch (err) {
        throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createItem(payload) {
    try {
        const payloadCreate = {
            title: payload.title,
            description: payload.description,
            user_apply: payload.user_apply || USER_APPLY.collaborator,
            type_notification: payload.type_notification || null,
            date_create: new Date().toISOString()
        }

        return await this.contentNotificationRepositoryService.create(payloadCreate)
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
            type_notification: payload.type_notification || getItem.type_notification,
            date_create: getItem.date_create
        }       

        const result = await this.contentNotificationRepositoryService.findByIdAndUpdate(idItem, payloadUpdate);
        return result;
    } catch (err) {
        throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
