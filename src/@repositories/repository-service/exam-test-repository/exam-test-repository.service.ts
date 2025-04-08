import { Injectable } from '@nestjs/common';
import { ExamTestMongoRepository } from 'src/@repositories/module/mongodb/repository/examtest.mongo.repository';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { BaseRepositoryService } from '../@base-repository/base-repository.abstract.service';
import { BaseRepositoryInterfaceService } from '../@base-repository/base-repository.interface.service';

@Injectable()
export class ExamTestRepositoryService extends BaseRepositoryService implements BaseRepositoryInterfaceService {
    constructor(
        private customExceptionService: CustomExceptionService,
        private examTestMongoRepository: ExamTestMongoRepository,
        // private serviceRedisRepository: ServiceRedisRepository,
    ){
        // super(serviceMongoRepository, serviceRedisRepository);
        super(examTestMongoRepository);

    }
}
