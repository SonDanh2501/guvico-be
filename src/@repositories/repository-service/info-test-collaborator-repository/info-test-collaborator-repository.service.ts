import { Injectable } from '@nestjs/common';
import { InfoTestCollaboratorMongoRepository } from 'src/@repositories/module/mongodb/repository/info-test-collaborator.mongo.repository';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { BaseRepositoryService } from '../@base-repository/base-repository.abstract.service';
import { BaseRepositoryInterfaceService } from '../@base-repository/base-repository.interface.service';

@Injectable()
export class InfoTestCollaboratorRepositoryService extends BaseRepositoryService implements BaseRepositoryInterfaceService {
    constructor(
        private infoTestCollaboratorMongoRepository: InfoTestCollaboratorMongoRepository,
        private customExceptionService: CustomExceptionService,
    ) {
        super(infoTestCollaboratorMongoRepository);
    }
}
