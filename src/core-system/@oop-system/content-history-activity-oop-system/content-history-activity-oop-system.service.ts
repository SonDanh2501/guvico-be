import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ERROR } from 'src/@core';
import { ContentHistoryActivityRepositoryService } from 'src/@repositories/repository-service/content-history-activity-repository/content-history-activity-repository.service';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';

@Injectable()
export class ContentHistoryActivityOopSystemService {
    constructor(
        private customExceptionService: CustomExceptionService,
        private contentHistoryActivityRepositoryService: ContentHistoryActivityRepositoryService
      ) { }
    
    async getDetailItem(lang, idItem) {
      try {
          const item = await this.contentHistoryActivityRepositoryService.findOneById(idItem);
          if(!item) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "content_history_activity")], HttpStatus.NOT_FOUND)
          return item;
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
          const getList = await this.contentHistoryActivityRepositoryService.getListPaginationDataByCondition(iPage, query, {}, { created_at: -1 },)

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
              title_admin: payload.title_admin || null,
              created_at: new Date().toISOString()
          }
  
          return await this.contentHistoryActivityRepositoryService.create(payloadCreate)
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
              title_admin: payload.title_admin || getItem.title_admin,
              created_at: getItem.created_at
          }       
  
          const result = await this.contentHistoryActivityRepositoryService.findByIdAndUpdate(idItem, payloadUpdate);
          return result;
      } catch (err) {
          throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
}
