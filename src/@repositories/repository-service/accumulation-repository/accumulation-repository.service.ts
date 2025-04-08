import { Injectable } from '@nestjs/common'
import { AccumulationMongoRepository } from 'src/@repositories/module/mongodb/repository/accumulation.mongo.repository'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
import { BaseRepositoryService } from '../@base-repository/base-repository.abstract.service'
import { BaseRepositoryInterfaceService } from '../@base-repository/base-repository.interface.service'

@Injectable()
export class AccumulationRepositoryService extends BaseRepositoryService implements BaseRepositoryInterfaceService {
    constructor(
        private customExceptionService: CustomExceptionService,
        private accumulationMongoRepository: AccumulationMongoRepository,
    ) {
        super(accumulationMongoRepository);
     }
}
