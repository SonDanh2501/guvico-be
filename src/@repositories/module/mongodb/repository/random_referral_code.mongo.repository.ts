// import { BaseEntity } from '@modules/shared/base/base.entity';
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { RandomReferralCode } from '../@database'
import { RandomReferralCodeRepositoryInterface } from '../interface'
import { BaseMongoRepositoryAbstract } from './base.mongo.repository.abstract'


export class RandomReferralCodeMongoRepository extends BaseMongoRepositoryAbstract<RandomReferralCode> implements RandomReferralCodeRepositoryInterface
{
    constructor(
        @InjectModel(RandomReferralCode.name)
        private readonly repository: Model<RandomReferralCode>,
    ) {
        super(repository);
    }
}
