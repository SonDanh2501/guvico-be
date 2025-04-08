import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ERROR, iPageDTO } from 'src/@core';
import { GroupServiceRepositoryService } from 'src/@repositories/repository-service/group-service-repository/group-service-repository.service';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';

@Injectable()
export class GroupServiceOopSystemService {
    constructor(
        private customExceptionService: CustomExceptionService,
        private groupServiceRepositoryService: GroupServiceRepositoryService
    ){}

    async getDetailItem(lang, idCustomer) {
        try {
            const getCustomer = await this.groupServiceRepositoryService.findOneById(idCustomer);
            if(!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "group_service")], HttpStatus.NOT_FOUND)
            return getCustomer;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    } 

    async getList(lang, iPage: iPageDTO, subject, user) {
        try {
            const query = {
                $and: []
            }
            
            const dataResult = await this.groupServiceRepositoryService.getListPaginationDataByCondition(iPage, query)
            return dataResult;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getListForApp(lang, iPage, subject, user) {
        try {
            const query = {
                $and: [
                    {
                        is_active: true
                    },
                    {
                        $or: [
                            { is_delete: false },
                            { is_delete: { $exists: false } }
                        ]
                    }
                ]
            }
            const dataResult = await this.groupServiceRepositoryService.getListPaginationDataByCondition(iPage, query, {}, { position: 1 })
            return dataResult;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
