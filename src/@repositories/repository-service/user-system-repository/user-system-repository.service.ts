import { Injectable } from '@nestjs/common';
import { BaseRepositoryService } from 'src/@repositories/repository-service/@base-repository/base-repository.abstract.service';
import { BaseRepositoryInterfaceService } from 'src/@repositories/repository-service/@base-repository/base-repository.interface.service';
import { UserSystemMongoRepository } from 'src/@repositories/module/mongodb/repository/user-system.repository';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { UserSystemRedisRepository } from 'src/@repositories/module/redis/repository/user-system.redis.repository';

@Injectable()
export class UserSystemRepositoryService extends BaseRepositoryService implements BaseRepositoryInterfaceService {
    constructor(
        private userSystemRepository: UserSystemMongoRepository,
        private userSystemRedisRepository: UserSystemRedisRepository,
        private customExceptionService: CustomExceptionService,
    ) {
        super(userSystemRepository);
        // super(userSystemRepository, userSystemRedisRepository);

    }
}
