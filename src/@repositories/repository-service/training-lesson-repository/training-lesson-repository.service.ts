import { Injectable } from '@nestjs/common';
import { TrainingLessonMongoRepository } from 'src/@repositories/module/mongodb/repository/training-lesson.mongo.repository';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { BaseRepositoryService } from '../@base-repository/base-repository.abstract.service';
import { BaseRepositoryInterfaceService } from '../@base-repository/base-repository.interface.service';

@Injectable()
export class TrainingLessonRepositoryService extends BaseRepositoryService implements BaseRepositoryInterfaceService {
    constructor(
        private customExceptionService: CustomExceptionService,
        private trainingLessonMongoRepository: TrainingLessonMongoRepository,
        // private serviceRedisRepository: ServiceRedisRepository,
    ){
        // super(serviceMongoRepository, serviceRedisRepository);
        super(trainingLessonMongoRepository);

    }
}
