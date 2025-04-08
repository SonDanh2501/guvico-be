import { Cache } from 'cache-manager'
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BaseRepositoryService } from 'src/@repositories/repository-service/@base-repository/base-repository.abstract.service';
import { BaseRepositoryInterfaceService } from 'src/@repositories/repository-service/@base-repository/base-repository.interface.service';
import { DeviceTokenMongoRepository } from 'src/@repositories/module/mongodb/repository/device-token.mongo.repository';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';

@Injectable()
export class DeviceTokenRepositoryService extends BaseRepositoryService implements BaseRepositoryInterfaceService {
    constructor(
        private deviceTokenMongoRepository: DeviceTokenMongoRepository,
        // private studioRepository: Repository(, redis)
        private customExceptionService: CustomExceptionService,

        
    ) {
        super(deviceTokenMongoRepository);
     }
}
