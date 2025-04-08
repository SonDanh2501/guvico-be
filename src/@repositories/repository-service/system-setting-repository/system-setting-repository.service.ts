import { Injectable } from '@nestjs/common'
import { SystemSettingMongoRepository } from 'src/@repositories/module/mongodb/repository/system-setting.mongo.repository'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
import { BaseRepositoryService } from '../@base-repository/base-repository.abstract.service'
import { BaseRepositoryInterfaceService } from '../@base-repository/base-repository.interface.service'

@Injectable()
export class SystemSettingRepositoryService extends BaseRepositoryService implements BaseRepositoryInterfaceService {
    constructor(
        private customExceptionService: CustomExceptionService,
        private systemSettingMongoRepository: SystemSettingMongoRepository,
    ){
        super(systemSettingMongoRepository);

    }
}
