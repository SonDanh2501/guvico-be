import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ERROR } from 'src/@core';
import { ReasonsCancelRepositoryService } from 'src/@repositories/repository-service/reasons-cancel-repository/reasons-cancel-repository.service';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';

@Injectable()
export class ReasonCancelOopSystemService {
    constructor(
        private customExceptionService: CustomExceptionService,
        private reasonsCancelRepositoryService: ReasonsCancelRepositoryService
    ) {}

    async getDetailItem(lang, idItem) {
        try {
            const item = await this.reasonsCancelRepositoryService.findOneById(idItem);
            if(!item) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "reason_cancel")], HttpStatus.NOT_FOUND)
            return item;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    } 
}
