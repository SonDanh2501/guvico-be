import { HttpException, HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { BaseRepositoryService } from 'src/@repositories/repository-service/@base-repository/base-repository.abstract.service';
import { BaseRepositoryInterfaceService } from 'src/@repositories/repository-service/@base-repository/base-repository.interface.service';
import { CollaboratorMongoRepository } from 'src/@repositories/module/mongodb/repository/collaborator.mongo.repository';
import { CustomerMongoRepository } from 'src/@repositories/module/mongodb/repository/customer.mongo.repository';
import { CollaboratorRedisRepository } from 'src/@repositories/module/redis/repository/collaborator.redis.repository';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';

@Injectable()
export class CollaboratorRepositoryService extends BaseRepositoryService implements BaseRepositoryInterfaceService {
    constructor(
        private collaboratorMongoRepository: CollaboratorMongoRepository,
        private collaboratorRedisRepository: CollaboratorRedisRepository,
        private customExceptionService: CustomExceptionService,
    ) {
        // super(collaboratorMongoRepository, collaboratorRedisRepository);
        super(collaboratorMongoRepository); 
    }

}
