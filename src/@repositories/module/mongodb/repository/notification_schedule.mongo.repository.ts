// import { BaseEntity } from '@modules/shared/base/base.entity';
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { NotificationSchedule } from '../@database'
import { NotificationScheduleRepositoryInterface } from '../interface'
import { BaseMongoRepositoryAbstract } from './base.mongo.repository.abstract'


export class NotificationScheduleMongoRepository extends BaseMongoRepositoryAbstract<NotificationSchedule> implements NotificationScheduleRepositoryInterface
{
    constructor(
        @InjectModel(NotificationSchedule.name)
        private readonly repository: Model<NotificationSchedule>,
    ) {
        super(repository);
    }
}
