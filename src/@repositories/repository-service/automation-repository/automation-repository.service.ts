import { Injectable } from '@nestjs/common';
import { BaseRepositoryService } from 'src/@repositories/repository-service/@base-repository/base-repository.abstract.service';
import { BaseRepositoryInterfaceService } from 'src/@repositories/repository-service/@base-repository/base-repository.interface.service';
import { AutomationMongoRepository } from 'src/@repositories/module/mongodb/repository/automation.mongo.repository';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';

@Injectable()
export class AutomationRepositoryService extends BaseRepositoryService implements BaseRepositoryInterfaceService {
    constructor(
        private automationMongoRepository: AutomationMongoRepository,
        private customExceptionService: CustomExceptionService,
    ) {
        super(automationMongoRepository);
    }
}