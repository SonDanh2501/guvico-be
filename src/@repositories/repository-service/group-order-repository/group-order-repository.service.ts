import { Injectable } from '@nestjs/common';
import { BaseRepositoryService } from 'src/@repositories/repository-service/@base-repository/base-repository.abstract.service';
import { BaseRepositoryInterfaceService } from 'src/@repositories/repository-service/@base-repository/base-repository.interface.service';
import { GroupOrderMongoRepository } from 'src/@repositories/module/mongodb/repository/group-order.mongo.repository';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';

@Injectable()
export class GroupOrderRepositoryService extends BaseRepositoryService implements BaseRepositoryInterfaceService {
    constructor(
        private groupOrderRepository: GroupOrderMongoRepository,
        private customExceptionService: CustomExceptionService,
    ) {
        super(groupOrderRepository)
    }

    
}
