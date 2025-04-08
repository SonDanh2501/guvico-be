import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ERROR } from 'src/@core';
import { GroupCustomerRepositoryService } from 'src/@repositories/repository-service/group-customer-repository/group-customer-repository.service';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service';

@Injectable()
export class GroupCustomerOopSystemService {
    constructor(
        private customExceptionService: CustomExceptionService,
        private generalHandleService: GeneralHandleService,

        private groupCustomerRepositoryService: GroupCustomerRepositoryService
    ) { }

    async getDetailItem(lang, idItem) {
        try {
            const getItem = await this.groupCustomerRepositoryService.findOneById(idItem);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "group_customer")], HttpStatus.NOT_FOUND)
            return getItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
