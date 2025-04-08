// import { BaseEntity } from '@modules/shared/base/base.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseMongoRepositoryAbstract } from './base.mongo.repository.abstract';
import { HistoryActivity } from '../@database';
import { HistoryActivityRepositoryInterface } from '../interface/history-activity.interface';

export class HistoryActivityMongoRepository extends BaseMongoRepositoryAbstract<HistoryActivity> implements HistoryActivityRepositoryInterface {
    constructor(
        @InjectModel(HistoryActivity.name)
        private readonly repository: Model<HistoryActivity>,
    ) {
        super(repository);
    }
}
