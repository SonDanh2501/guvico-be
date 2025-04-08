// import { BaseEntity } from '@modules/shared/base/base.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseMongoRepositoryAbstract } from './base.mongo.repository.abstract';
import { OptionalServiceRepositoryInterface } from '../interface';
import { OptionalService } from '../@database';

export class OptionalServiceMongoRepository extends BaseMongoRepositoryAbstract<OptionalService> implements OptionalServiceRepositoryInterface
{
    constructor(
        @InjectModel(OptionalService.name)
        private readonly repository: Model<OptionalService>,
    ) {
        super(repository);
    }
}
