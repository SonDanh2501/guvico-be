import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { ObjectId } from 'bson'
import { TYPE_SUBJECT_ACTION } from 'src/@repositories/module/mongodb/@database/enum/base.enum'
import { HistoryActivityOopSystemService } from 'src/core-system/@oop-system/history-activity-oop-system/history-activity-oop-system.service'

@Injectable()
export class HistoryActivitySystemService {
    constructor(
        private historyActivityOopSystemService: HistoryActivityOopSystemService,
    ){}

    async getListCollaborators (idCollaborator,iPage) {
        try {
            const result = await this.historyActivityOopSystemService.getListForCollaborator(idCollaborator,iPage);
            return result;
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getListHistoryActivitiesForReferrerPerson(subjectAction, iPage, id_customer?) {
        try {
            const idCustomer = subjectAction.type === TYPE_SUBJECT_ACTION.customer ? subjectAction._id : new ObjectId(id_customer)
            return await this.historyActivityOopSystemService.getListPaginationForReferrerPerson(subjectAction, iPage, idCustomer);
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getListHistoryRewardPointByIdCollaborator(idCollaborator, iPage,) {
        try {
            return await this.historyActivityOopSystemService.getListRewardPointByIdCollaborator(idCollaborator, iPage);
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getListHistoryRewardMoneyByIdCollaborator(idCollaborator, iPage,) {
        try {
            return await this.historyActivityOopSystemService.getListRewardMoneyByIdCollaborator(idCollaborator, iPage);
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getListPunishTicketByIdCollaborator(idCollaborator, iPage,) {
        try {
            return await this.historyActivityOopSystemService.getListPunishTicketByIdCollaborator(idCollaborator, iPage);
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getListHistoryActivitiesForGroupOrder(lang, iPage, subjectAction, idGroupOrder) {
        try 
        {
            const result = await this.historyActivityOopSystemService.getListHistoryActivitiesForGroupOrder(lang, iPage, subjectAction, idGroupOrder);
            return result;
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
