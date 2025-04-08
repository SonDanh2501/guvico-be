import { Injectable } from '@nestjs/common'
import { LeaderBoardMongoRepository } from 'src/@repositories/module/mongodb/repository/leader-board.mongo.repository'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
import { BaseRepositoryService } from '../@base-repository/base-repository.abstract.service'
import { BaseRepositoryInterfaceService } from '../@base-repository/base-repository.interface.service'

@Injectable()
export class LeaderBoardRepositoryService extends BaseRepositoryService implements BaseRepositoryInterfaceService {
    constructor(
        private leaderBoardMongoRepository: LeaderBoardMongoRepository,
        private customExceptionService: CustomExceptionService,
    ) {
        super(leaderBoardMongoRepository);
    }
}
