// import { BaseEntity } from '@modules/shared/base/base.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseMongoRepositoryAbstract } from './base.mongo.repository.abstract';
import { CollaboratorRepositoryInterface } from 'src/@repositories/module/mongodb/interface/collaborator.interface';
import { Collaborator } from '../@database';

export class CollaboratorMongoRepository extends BaseMongoRepositoryAbstract<Collaborator> implements CollaboratorRepositoryInterface
{
    constructor(
        @InjectModel(Collaborator.name)
        private readonly repository: Model<Collaborator>,
    ) {
        super(repository);
    }
}
