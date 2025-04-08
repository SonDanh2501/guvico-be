// import { BaseEntity } from '@modules/shared/base/base.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseMongoRepositoryAbstract } from './base.mongo.repository.abstract';
import { DeviceToken } from '../@database';
import { DeviceTokenRepositoryInterface } from '../interface';

export class DeviceTokenMongoRepository extends BaseMongoRepositoryAbstract<DeviceToken> implements DeviceTokenRepositoryInterface
{
    constructor(
        @InjectModel(DeviceToken.name)
        private readonly repository: Model<DeviceToken>,
    ) {
        super(repository);
    }
}
