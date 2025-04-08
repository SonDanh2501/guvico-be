// import { BaseEntity } from '@modules/shared/base/base.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseMongoRepositoryAbstract } from './base.mongo.repository.abstract';
import { CollaboratorRepositoryInterface } from 'src/@repositories/module/mongodb/interface/collaborator.interface';
import { ContentNotification } from '../@database';
import { ContentNotificationRepositoryInterface } from '../interface/content-notification.interface';

export class ContentNotificationMongoRepository extends BaseMongoRepositoryAbstract<ContentNotification> implements ContentNotificationRepositoryInterface
{
    constructor(
        @InjectModel(ContentNotification.name)
        private readonly repository: Model<ContentNotification>,
    ) {
        super(repository);
    }
}
