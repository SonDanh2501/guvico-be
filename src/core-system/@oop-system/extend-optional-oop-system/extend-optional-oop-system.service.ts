import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { ERROR } from 'src/@core';
import { ExtendOptionalRepositoryService } from 'src/@repositories/repository-service/extend-optional-repository/extend-optional-repository.service';
import { ServiceRepositoryService } from 'src/@repositories/repository-service/service-repository/service-repository.service';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';

@Injectable()
export class ExtendOptionalOopSystemService {
    constructor(
        private customExceptionService: CustomExceptionService,
        private extendOptionalRepositoryService: ExtendOptionalRepositoryService
    ) {}

    async getDetailItem(lang, idItem) {
        try {
            const getItem = await this.extendOptionalRepositoryService.findOneById(idItem);
            if(!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "extend_optional")], HttpStatus.NOT_FOUND)
            return getItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getListWithArrId(arrId) {
        try {
            for(let i = 0 ; i < arrId.length ; i++) {
                arrId[i] = new Types.ObjectId(arrId[i])
            }
            const query = {
                $and: [
                    {_id: {$in: arrId}}
                ]
            }

            const dataResult = await this.extendOptionalRepositoryService.getListDataByCondition(query);
            return dataResult;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
