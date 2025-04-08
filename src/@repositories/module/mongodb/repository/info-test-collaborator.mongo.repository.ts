// import { BaseEntity } from '@modules/shared/base/base.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseMongoRepositoryAbstract } from './base.mongo.repository.abstract';
import { HistoryActivity, InfoTestCollaborator } from '../@database';
import { HistoryActivityRepositoryInterface } from '../interface/history-activity.interface';
import { InfoTestCollaboratorRepositoryInterface } from '../interface';

export class InfoTestCollaboratorMongoRepository extends BaseMongoRepositoryAbstract<InfoTestCollaborator> implements InfoTestCollaboratorRepositoryInterface {
    constructor(
        @InjectModel(InfoTestCollaborator.name)
        private readonly repository: Model<InfoTestCollaborator>,
    ) {
        super(repository);
    }
}
