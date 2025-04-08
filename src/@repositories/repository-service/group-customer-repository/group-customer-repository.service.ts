import { Injectable } from '@nestjs/common';
import { BaseRepositoryService } from 'src/@repositories/repository-service/@base-repository/base-repository.abstract.service';
import { BaseRepositoryInterfaceService } from 'src/@repositories/repository-service/@base-repository/base-repository.interface.service';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { GroupCustomerMongoRepository } from 'src/@repositories/module/mongodb/repository/group-customer.mongo.repository';

@Injectable()
export class GroupCustomerRepositoryService extends BaseRepositoryService implements BaseRepositoryInterfaceService {
    constructor(
        private groupCustomerRepository: GroupCustomerMongoRepository,
        private customExceptionService: CustomExceptionService,
    ) {
        super(groupCustomerRepository)
    }

    
}
