import { Cache } from 'cache-manager'
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BaseRepositoryService } from 'src/@repositories/repository-service/@base-repository/base-repository.abstract.service';
import { BaseRepositoryInterfaceService } from 'src/@repositories/repository-service/@base-repository/base-repository.interface.service';
import { CustomerMongoRepository } from 'src/@repositories/module/mongodb/repository/customer.mongo.repository';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { CustomerRedisRepository } from 'src/@repositories/module/redis/repository/customer.redis.repository';

@Injectable()
export class CustomerRepositoryService extends BaseRepositoryService implements BaseRepositoryInterfaceService {
    constructor(
        private customerMongoRepository: CustomerMongoRepository,
        private customExceptionService: CustomExceptionService,
        private customerRedisRepository: CustomerRedisRepository,
    ) {
        // super(customerMongoRepository, customerRedisRepository);
        super(customerMongoRepository);
     }
}
