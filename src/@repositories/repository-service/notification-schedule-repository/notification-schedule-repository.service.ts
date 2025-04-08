import { Injectable } from '@nestjs/common'
import { NotificationScheduleMongoRepository } from 'src/@repositories/module/mongodb/repository/notification_schedule.mongo.repository'
import { BaseRepositoryService } from '../@base-repository/base-repository.abstract.service'
import { BaseRepositoryInterfaceService } from '../@base-repository/base-repository.interface.service'

@Injectable()
export class NotificationScheduleRepositoryService extends BaseRepositoryService implements BaseRepositoryInterfaceService {
  constructor(
    private notificationScheduleMongoRepository: NotificationScheduleMongoRepository,
) {
    super(notificationScheduleMongoRepository);
}
}
