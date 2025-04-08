// import { BaseEntity } from '@modules/shared/base/base.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseMongoRepositoryAbstract } from './base.mongo.repository.abstract';
import { ServiceFee } from '../@database';
import { ServiceFeeRepositoryInterface } from '../interface';

export class ServiceFeeMongoRepository extends BaseMongoRepositoryAbstract<ServiceFee> implements ServiceFeeRepositoryInterface
{
    constructor(
        @InjectModel(ServiceFee.name)
        private readonly repository: Model<ServiceFee>,
    ) {
        super(repository);
    }
}
