// import { BaseEntity } from '@modules/shared/base/base.entity';
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { LeaderBoard } from '../@database'
import { LeaderBoardRepositoryInterface } from '../interface'
import { BaseMongoRepositoryAbstract } from './base.mongo.repository.abstract'

export class LeaderBoardMongoRepository extends BaseMongoRepositoryAbstract<LeaderBoard> implements LeaderBoardRepositoryInterface {
    constructor(
        @InjectModel(LeaderBoard.name)
        private readonly repository: Model<LeaderBoard>,
    ) {
        super(repository);
    }
}
