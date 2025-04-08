// import { BaseEntity } from '@modules/shared/base/base.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseMongoRepositoryAbstract } from './base.mongo.repository.abstract';
import { GroupOrderRepositoryInterface } from '../interface';
import { GroupOrder } from '../@database';
// import { FindAllResponse } from 'src/types/common.type';

export class GroupOrderMongoRepository extends BaseMongoRepositoryAbstract<GroupOrder> implements GroupOrderRepositoryInterface
{
    constructor(
        @InjectModel(GroupOrder.name)
        private readonly repository: Model<GroupOrder>,
    ) {
        super(repository);
    }
}
