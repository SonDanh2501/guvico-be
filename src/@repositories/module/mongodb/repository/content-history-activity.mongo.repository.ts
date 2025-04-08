import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { ContentHistoryActivity } from '../@database'
import { ContentHistoryActivityRepositoryInterface } from '../interface/content-history-activity.interface'
import { BaseMongoRepositoryAbstract } from './base.mongo.repository.abstract'

export class ContentHistoryActivityMongoRepository extends BaseMongoRepositoryAbstract<ContentHistoryActivity> implements ContentHistoryActivityRepositoryInterface
{
    constructor(
        @InjectModel(ContentHistoryActivity.name)
        private readonly repository: Model<ContentHistoryActivity>,
    ) {
        super(repository);
    }
}
