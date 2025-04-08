import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { iPageDTO } from 'src/@core';
import { TYPE_SUBJECT_ACTION } from 'src/@repositories/module/mongodb/@database/enum/base.enum';
import { ContentNotificationOopSystemService } from 'src/core-system/@oop-system/content-notification-oop-system/content-notification-oop-system.service';
import { HistoryActivityOopSystemService } from 'src/core-system/@oop-system/history-activity-oop-system/history-activity-oop-system.service';
import { UserSystemOoopSystemService } from 'src/core-system/@oop-system/user-system-ooop-system/user-system-ooop-system.service';

@Injectable()
export class ContentNotificationSystemService {
    constructor(
      private contentNotificationOopSystemService: ContentNotificationOopSystemService,
      private historyActivityOopSystemService: HistoryActivityOopSystemService,
      private userSystemOoopSystemService: UserSystemOoopSystemService,
    ) {}


    async getDetailItem(lang, idItem) {
      try {
          return this.contentNotificationOopSystemService.getDetailItem(lang, idItem)
      } catch (err) {
          throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
    
    async createNewItem(lang, subjectAction, payload) {
      try {
        const payloadDependency = {
          content_notification: null,
          admin_action: null,
        }
  
        if(subjectAction.type === TYPE_SUBJECT_ACTION.admin) {
          payloadDependency.admin_action = await this.userSystemOoopSystemService.getDetailItem(lang, subjectAction._id)
        }
  
        payloadDependency.content_notification = await this.contentNotificationOopSystemService.createItem(payload)
        await this.historyActivityOopSystemService.createContentNotification(subjectAction, payloadDependency)
  
        return true
      } catch(err) {
        throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
    
    async getListItem(lang, iPage: iPageDTO) {
      try {
        return await this.contentNotificationOopSystemService.getList(iPage)
      } catch(err) {
        throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  
    async updateItem(lang, subjectAction, idItem, payload) {
      try {
        const payloadDependency = {
          content_notification: null,
          admin_action: null,
        }
        if(subjectAction.type === TYPE_SUBJECT_ACTION.admin) {
          payloadDependency.admin_action = await this.userSystemOoopSystemService.getDetailItem(lang, subjectAction._id)
        }
        payloadDependency.content_notification = await this.contentNotificationOopSystemService.updateItem(lang, idItem, payload)
        await this.historyActivityOopSystemService.updateContentNotification(subjectAction, payloadDependency)
      } catch (err) {
          throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
    
}
