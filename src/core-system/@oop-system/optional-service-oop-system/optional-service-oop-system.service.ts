import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { ERROR } from 'src/@core';
import { OptionalServiceRepositoryService } from 'src/@repositories/repository-service/optional-service-repository/optional-service-repository.service';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';

@Injectable()
export class OptionalServiceOopSystemService {
    constructor(
        private customExceptionService: CustomExceptionService,
        private optionalServiceRepositoryService: OptionalServiceRepositoryService
    ){}
    
    async getDetailItem(lang, idItem) {
        try {
            const getItem = await this.optionalServiceRepositoryService.findOneById(idItem);
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

            const dataResult = await this.optionalServiceRepositoryService.getListDataByCondition(query);
            return dataResult;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
