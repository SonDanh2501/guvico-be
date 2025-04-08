import { Injectable } from '@nestjs/common'
import { ContentHistoryActivityMongoRepository } from 'src/@repositories/module/mongodb/repository/content-history-activity.mongo.repository'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
import { BaseRepositoryService } from '../@base-repository/base-repository.abstract.service'
import { BaseRepositoryInterfaceService } from '../@base-repository/base-repository.interface.service'

@Injectable()
export class ContentHistoryActivityRepositoryService extends BaseRepositoryService implements BaseRepositoryInterfaceService {
    constructor(
        private contentHistoryActivityMongoRepository: ContentHistoryActivityMongoRepository,
        private customExceptionService: CustomExceptionService,
    ) {
        super(contentHistoryActivityMongoRepository);
    }
}
