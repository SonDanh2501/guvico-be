import { Injectable } from '@nestjs/common';
import { BaseRepositoryService } from '../@base-repository/base-repository.abstract.service';
import { BaseRepositoryInterfaceService } from '../@base-repository/base-repository.interface.service';
import { CustomerSettingMongoRepository } from 'src/@repositories/module/mongodb/repository/customer-setting.mongo.repository';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';

@Injectable()
export class CustomerSettingRepositoryService extends BaseRepositoryService implements BaseRepositoryInterfaceService {
    constructor(
        private customExceptionService: CustomExceptionService,
        private customerSettingMongoRepository: CustomerSettingMongoRepository,
    ) {
        // super(customerMongoRepository, customerRedisRepository);
        super(customerSettingMongoRepository);
     }
}
