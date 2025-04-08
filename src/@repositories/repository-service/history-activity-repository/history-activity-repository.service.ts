import { Injectable } from '@nestjs/common';
import { BaseRepositoryService } from 'src/@repositories/repository-service/@base-repository/base-repository.abstract.service';
import { BaseRepositoryInterfaceService } from 'src/@repositories/repository-service/@base-repository/base-repository.interface.service';
import { HistoryActivityMongoRepository } from 'src/@repositories/module/mongodb/repository/history-activity.mongo.repository';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';

@Injectable()
export class HistoryActivityRepositoryService extends BaseRepositoryService implements BaseRepositoryInterfaceService {
    constructor(
        private historyActivityMongoRepository: HistoryActivityMongoRepository,
        private customExceptionService: CustomExceptionService,
    ) {
        super(historyActivityMongoRepository);
    }
}