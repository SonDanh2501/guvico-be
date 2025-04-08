// import { BaseEntity } from '@modules/shared/base/base.entity';
import { FilterQuery, Model, QueryOptions } from 'mongoose';
import { Customer } from 'src/@core';
import { InjectModel } from '@nestjs/mongoose';
import { BaseMongoRepositoryAbstract } from './base.mongo.repository.abstract';
import { UserSystem } from '../@database';
import { UserSystemRepositoryInterface } from '../interface/user-system.interface';
// import { FindAllResponse } from 'src/types/common.type';

export class UserSystemMongoRepository extends BaseMongoRepositoryAbstract<UserSystem> implements UserSystemRepositoryInterface
{
    constructor(
        @InjectModel(UserSystem.name)
        private readonly repository: Model<UserSystem>,
    ) {
        super(repository);
    }
}
