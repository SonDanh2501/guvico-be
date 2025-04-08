import { Injectable } from '@nestjs/common';
import { BaseRepositoryService } from '../@base-repository/base-repository.abstract.service';
import { BaseRepositoryInterfaceService } from '../@base-repository/base-repository.interface.service';
import { NotificationMongoRepository } from 'src/@repositories/module/mongodb/repository/notification.mongo.repository';

@Injectable()
export class NotificationRepositoryService extends BaseRepositoryService implements BaseRepositoryInterfaceService {
    constructor(
        private notificationMongoRepository: NotificationMongoRepository,
    ) {
        super(notificationMongoRepository);
    }
}
