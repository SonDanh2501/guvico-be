// import { BaseEntity } from '@modules/shared/base/base.entity';
import { FilterQuery, Model, QueryOptions } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseMongoRepositoryAbstract } from './base.mongo.repository.abstract';
import { CustomerRepositoryInterface } from 'src/@repositories/module/mongodb/interface/customer.interface';
import { OrderRepositoryInterface, PromotionRepositoryInterface } from '../interface';
import { Order, Promotion } from '../@database';
// import { FindAllResponse } from 'src/types/common.type';

export class PromotionMongoRepository extends BaseMongoRepositoryAbstract<Promotion> implements PromotionRepositoryInterface
{
    constructor(
        @InjectModel(Promotion.name)
        private readonly repository: Model<Promotion>,
    ) {
        super(repository);
    }
}
