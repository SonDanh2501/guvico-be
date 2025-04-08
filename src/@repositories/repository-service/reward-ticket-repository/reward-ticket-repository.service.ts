import { Injectable } from '@nestjs/common';
import { BaseRepositoryService } from 'src/@repositories/repository-service/@base-repository/base-repository.abstract.service';
import { BaseRepositoryInterfaceService } from 'src/@repositories/repository-service/@base-repository/base-repository.interface.service';
import { RewardTicketMongoRepository } from 'src/@repositories/module/mongodb/repository/reward-ticket.mongo.repository';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';

@Injectable()
export class RewardTicketRepositoryService extends BaseRepositoryService implements BaseRepositoryInterfaceService{
    constructor(
        private customExceptionService: CustomExceptionService,
        private rewardTicketRepository:RewardTicketMongoRepository,
    ){
        super(rewardTicketRepository);
    }
}
