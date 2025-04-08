// import { BaseEntity } from '@modules/shared/base/base.entity';
import { FilterQuery, Model, QueryOptions } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseMongoRepositoryAbstract } from './base.mongo.repository.abstract';
import { CustomerRepositoryInterface } from 'src/@repositories/module/mongodb/interface/customer.interface';
import { OrderRepositoryInterface } from '../interface';
import { Order } from '../@database';
// import { FindAllResponse } from 'src/types/common.type';

export class OrderMongoRepository extends BaseMongoRepositoryAbstract<Order> implements OrderRepositoryInterface
{
    constructor(
        @InjectModel(Order.name)
        private readonly repository: Model<Order>,
    ) {
        super(repository);
    }
}
