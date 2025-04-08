import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ERROR } from 'src/@core';
import { ServiceFeeRepositoryService } from 'src/@repositories/repository-service/service-fee-repository/service-fee-repository.service';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';

@Injectable()
export class ServiceFeeOopSystemService {
    constructor(
        private customExceptionService: CustomExceptionService,
        private serviceFeeRepositoryService: ServiceFeeRepositoryService
    ) {}

    async getDetailItem(lang, idItem) {
        try {
            const getItem = await this.serviceFeeRepositoryService.findOneById(idItem);
            if(!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "promotion")], HttpStatus.NOT_FOUND)
            return getItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getServiceFeeByinfoJob(lang, infoJob) {
        try {
            const query = {
                $and: []
            }
            const serviceFee = await this.serviceFeeRepositoryService.getListDataByCondition(query);
            return serviceFee;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
