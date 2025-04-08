import { Injectable } from '@nestjs/common';
import { GroupServiceMongoRepository } from 'src/@repositories/module/mongodb/repository/group-service.mongo.repository';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { BaseRepositoryService } from '../@base-repository/base-repository.abstract.service';
import { BaseRepositoryInterfaceService } from '../@base-repository/base-repository.interface.service';

@Injectable()
export class GroupServiceRepositoryService extends BaseRepositoryService implements BaseRepositoryInterfaceService {
        constructor(
            private customExceptionService: CustomExceptionService,
            private groupServiceMongoRepository: GroupServiceMongoRepository,
        ){
            super(groupServiceMongoRepository);
        }
}
