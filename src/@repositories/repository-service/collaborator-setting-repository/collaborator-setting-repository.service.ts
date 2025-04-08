import { Injectable } from '@nestjs/common';
import { BaseRepositoryInterfaceService } from '../@base-repository/base-repository.interface.service';
import { BaseRepositoryService } from '../@base-repository/base-repository.abstract.service';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { CollaboratorSettingMongoRepository } from 'src/@repositories/module/mongodb/repository/collaborator-setting.mongo.repository';

@Injectable()
export class CollaboratorSettingRepositoryService extends BaseRepositoryService implements BaseRepositoryInterfaceService {
    constructor(
        private customExceptionService: CustomExceptionService,
        private collaboratorSettingMongoRepository: CollaboratorSettingMongoRepository,
    ) {
        // super(customerMongoRepository, customerRedisRepository);
        super(collaboratorSettingMongoRepository);
     }
}
