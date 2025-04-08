import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { iPageDTO } from 'src/@core';
import { TYPE_SUBJECT_ACTION } from 'src/@repositories/module/mongodb/@database/enum/base.enum';
import { ContentHistoryActivityOopSystemService } from 'src/core-system/@oop-system/content-history-activity-oop-system/content-history-activity-oop-system.service';
import { HistoryActivityOopSystemService } from 'src/core-system/@oop-system/history-activity-oop-system/history-activity-oop-system.service';
import { UserSystemOoopSystemService } from 'src/core-system/@oop-system/user-system-ooop-system/user-system-ooop-system.service';

@Injectable()
export class ContentHistoryActivitySystemService {
    constructor(
      private contentHistoryActivityOopSystemService: ContentHistoryActivityOopSystemService,
      private userSystemOoopSystemService: UserSystemOoopSystemService,
      private historyActivityOopSystemService: HistoryActivityOopSystemService,
    ) { }
  
    async getDetailItem(lang, idItem) {
      try {
          return this.contentHistoryActivityOopSystemService.getDetailItem(lang, idItem)
      } catch (err) {
          throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    async getListItem(lang, iPage: iPageDTO) {
      try {
        return await this.contentHistoryActivityOopSystemService.getList(iPage)
      } catch(err) {
        throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    async createNewItem(lang, subjectAction, payload) {
      try {
        const payloadDependency = {
          content_history_activity: null,
          admin_action: null,
        }
  
        if(subjectAction.type === TYPE_SUBJECT_ACTION.admin) {
          payloadDependency.admin_action = await this.userSystemOoopSystemService.getDetailItem(lang, subjectAction._id)
        }
  
        payloadDependency.content_history_activity = await this.contentHistoryActivityOopSystemService.createItem(payload)
        await this.historyActivityOopSystemService.createContentHistoryActivity(subjectAction, payloadDependency)
  
        return true
      } catch(err) {
        throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    async updateItem(lang, subjectAction, idItem, payload) {
      try {
        const payloadDependency = {
          content_history_activity: null,
          admin_action: null,
        }
        if(subjectAction.type === TYPE_SUBJECT_ACTION.admin) {
          payloadDependency.admin_action = await this.userSystemOoopSystemService.getDetailItem(lang, subjectAction._id)
        }
        payloadDependency.content_history_activity = await this.contentHistoryActivityOopSystemService.updateItem(lang, idItem, payload)
        await this.historyActivityOopSystemService.updateContentHistoryActivity(subjectAction, payloadDependency)
      } catch (err) {
          throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
}
