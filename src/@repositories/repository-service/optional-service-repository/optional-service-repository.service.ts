import { Injectable } from '@nestjs/common';
import { BaseRepositoryService } from '../@base-repository/base-repository.abstract.service';
import { BaseRepositoryInterfaceService } from '../@base-repository/base-repository.interface.service';
import { OptionalServiceMongoRepository } from 'src/@repositories/module/mongodb/repository/optional-service.mongo.repository';

@Injectable()
export class OptionalServiceRepositoryService extends BaseRepositoryService implements BaseRepositoryInterfaceService {
    constructor(
        private optionalServiceMongoRepository: OptionalServiceMongoRepository,
    ) {
        super(optionalServiceMongoRepository);
    }
}
