import { Injectable } from '@nestjs/common'
import { PhoneBlacklistMongoRepository } from 'src/@repositories/module/mongodb/repository/phone-blacklist.mongo.repository'
import { BaseRepositoryService } from 'src/@repositories/repository-service/@base-repository/base-repository.abstract.service'
import { BaseRepositoryInterfaceService } from 'src/@repositories/repository-service/@base-repository/base-repository.interface.service'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'

@Injectable()
export class PhoneBlacklistRepositoryService extends BaseRepositoryService implements BaseRepositoryInterfaceService {
    constructor(
        private phoneBlacklistRepository: PhoneBlacklistMongoRepository,
        private customExceptionService: CustomExceptionService,
    ) {
        super(phoneBlacklistRepository)
    }

    
}
