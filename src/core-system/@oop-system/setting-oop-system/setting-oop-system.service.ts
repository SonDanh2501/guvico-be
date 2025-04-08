import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { ERROR } from 'src/@core'
import { CollaboratorSettingRepositoryService } from 'src/@repositories/repository-service/collaborator-setting-repository/collaborator-setting-repository.service'
import { CustomerSettingRepositoryService } from 'src/@repositories/repository-service/customer-setting-repository/customer-setting-repository.service'
import { SystemSettingRepositoryService } from 'src/@repositories/repository-service/system-setting-repository/system-setting-repository.service'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'

@Injectable()
export class SettingOopSystemService {
    constructor(
        private customExceptionService: CustomExceptionService,
        private customerSettingRepositoryService: CustomerSettingRepositoryService,
        private collaboratorSettingRepositoryService: CollaboratorSettingRepositoryService,
        private systemSettingRepositoryService: SystemSettingRepositoryService
    ){}

    async getCustomerSetting(lang) {
        try {
            const getItem = await this.customerSettingRepositoryService.findOne();
            if(!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "customer_setting")], HttpStatus.NOT_FOUND)
            return getItem; 
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getCollaboratorSetting(lang) {
        try {
            const getItem = await this.collaboratorSettingRepositoryService.findOne();
            if(!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "collbaorator_setting")], HttpStatus.NOT_FOUND)
            return getItem; 
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    async getSystemSetting(lang) {
        try {
            const getItem = await this.systemSettingRepositoryService.findOne()
            if(!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "system_setting")], HttpStatus.NOT_FOUND)

            return getItem
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
