// import { BaseEntity } from '@modules/shared/base/base.entity';
import { FilterQuery, Model, QueryOptions } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseMongoRepositoryAbstract } from './base.mongo.repository.abstract';
import { CustomerRepositoryInterface } from 'src/@repositories/module/mongodb/interface/customer.interface';
import { Customer } from '../@database';
// import { FindAllResponse } from 'src/types/common.type';

export class CustomerMongoRepository extends BaseMongoRepositoryAbstract<Customer> implements CustomerRepositoryInterface
{
    constructor(
        @InjectModel(Customer.name)
        private readonly repository: Model<Customer>,
    ) {
        super(repository);
    }
}
