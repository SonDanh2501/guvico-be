import { Injectable } from '@nestjs/common';
import { BaseRepositoryService } from '../@base-repository/base-repository.abstract.service';
import { BaseRepositoryInterfaceService } from '../@base-repository/base-repository.interface.service';
import { PromotionMongoRepository } from 'src/@repositories/module/mongodb/repository/promotion.mongo.repository';

@Injectable()
export class PromotionRepositoryService extends BaseRepositoryService implements BaseRepositoryInterfaceService {
    constructor(
        private promotionMongoRepository: PromotionMongoRepository,
    ) { 
        super(promotionMongoRepository);
     }
}
