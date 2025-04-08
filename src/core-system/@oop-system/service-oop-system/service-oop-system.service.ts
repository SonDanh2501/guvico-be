import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ERROR, iPageDTO } from 'src/@core';
import { ServiceRepositoryService } from 'src/@repositories/repository-service/service-repository/service-repository.service';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';

@Injectable()
export class ServiceOopSystemService {
    constructor(
        private customExceptionService: CustomExceptionService,
        private serviceRepositoryService: ServiceRepositoryService
    ) {}

    async getDetailItem(lang, idCustomer) {
        try {
            const getCustomer = await this.serviceRepositoryService.findOneById(idCustomer);
            if(!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "service")], HttpStatus.NOT_FOUND)
            return getCustomer;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getList(lang, subjectAction, iPage: iPageDTO) {
        try {
            const query = {
                $and: []
            }
            const dataResult = await this.serviceRepositoryService.getListPaginationDataByCondition(iPage, query)
            return dataResult;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
