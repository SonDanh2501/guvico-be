import { Injectable } from '@nestjs/common';
import { BaseRepositoryService } from 'src/@repositories/repository-service/@base-repository/base-repository.abstract.service';
import { BaseRepositoryInterfaceService } from 'src/@repositories/repository-service/@base-repository/base-repository.interface.service';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { ContentNotificationMongoRepository } from 'src/@repositories/module/mongodb/repository/content_notification.mongo.repository';

@Injectable()
export class ContentNotificationRepositoryService extends BaseRepositoryService implements BaseRepositoryInterfaceService {
    constructor(
        private contentNotificationMongoRepository: ContentNotificationMongoRepository,
        private customExceptionService: CustomExceptionService,
    ) {
        super(contentNotificationMongoRepository);
    }
}