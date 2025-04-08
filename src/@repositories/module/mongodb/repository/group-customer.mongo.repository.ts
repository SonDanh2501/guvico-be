import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseMongoRepositoryAbstract } from './base.mongo.repository.abstract';
import { GroupCustomer } from '../@database';
import { GroupCustomerRepositoryInterface } from '../interface';

export class GroupCustomerMongoRepository extends BaseMongoRepositoryAbstract<GroupCustomer> implements GroupCustomerRepositoryInterface
{
    constructor(
        @InjectModel(GroupCustomer.name)
        private readonly repository: Model<GroupCustomer>,
    ) {
        super(repository);
    }
}
