import { Injectable } from '@nestjs/common'
import { RandomReferralCodeMongoRepository } from 'src/@repositories/module/mongodb/repository/random_referral_code.mongo.repository'
import { BaseRepositoryService } from '../@base-repository/base-repository.abstract.service'
import { BaseRepositoryInterfaceService } from '../@base-repository/base-repository.interface.service'

@Injectable()
export class RandomReferralCodeRepositoryService extends BaseRepositoryService implements BaseRepositoryInterfaceService {
  constructor(
    private notificationScheduleMongoRepository: RandomReferralCodeMongoRepository,
) {
    super(notificationScheduleMongoRepository);
}
}
