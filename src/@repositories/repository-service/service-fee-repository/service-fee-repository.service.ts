import { Injectable } from '@nestjs/common';
import { ServiceFeeMongoRepository } from 'src/@repositories/module/mongodb/repository/service-fee.mongo.repository';
import { BaseRepositoryService } from '../@base-repository/base-repository.abstract.service';
import { BaseRepositoryInterfaceService } from '../@base-repository/base-repository.interface.service';

@Injectable()
export class ServiceFeeRepositoryService extends BaseRepositoryService implements BaseRepositoryInterfaceService {
    constructor(
        private serviceFeeMongoRepository: ServiceFeeMongoRepository,
    ) { 
        super(serviceFeeMongoRepository);
     }
}
