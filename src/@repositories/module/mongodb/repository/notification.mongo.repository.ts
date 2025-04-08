// import { BaseEntity } from '@modules/shared/base/base.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseMongoRepositoryAbstract } from './base.mongo.repository.abstract';
import { NotificationRepositoryInterface } from '../interface/notification.interface';
import { Notification } from '../@database';


export class NotificationMongoRepository extends BaseMongoRepositoryAbstract<Notification> implements NotificationRepositoryInterface
{
    constructor(
        @InjectModel(Notification.name)
        private readonly repository: Model<Notification>,
    ) {
        super(repository);
    }
}
