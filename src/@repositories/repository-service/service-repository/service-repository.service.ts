import { Injectable } from '@nestjs/common';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { BaseRepositoryService } from '../@base-repository/base-repository.abstract.service';
import { BaseRepositoryInterfaceService } from '../@base-repository/base-repository.interface.service';
import { ServiceMongoRepository } from 'src/@repositories/module/mongodb/repository/service.mongo.repository';
import { ServiceRedisRepository } from 'src/@repositories/module/redis/repository/service.redis.repository';

@Injectable()
export class ServiceRepositoryService extends BaseRepositoryService implements BaseRepositoryInterfaceService {
    constructor(
        private customExceptionService: CustomExceptionService,
        private serviceMongoRepository: ServiceMongoRepository,
        private serviceRedisRepository: ServiceRedisRepository,
    ){
        // super(serviceMongoRepository, serviceRedisRepository);
        super(serviceMongoRepository);

    }
}
