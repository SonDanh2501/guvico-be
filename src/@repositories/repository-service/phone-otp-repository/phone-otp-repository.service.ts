import { Injectable } from '@nestjs/common'
import { PhoneOTPMongoRepository } from 'src/@repositories/module/mongodb/repository/phone-otp.monogo.repository'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
import { BaseRepositoryService } from '../@base-repository/base-repository.abstract.service'
import { BaseRepositoryInterfaceService } from '../@base-repository/base-repository.interface.service'

@Injectable()
export class PhoneOTPRepositoryService extends BaseRepositoryService implements BaseRepositoryInterfaceService {
  constructor(
    private phoneOTPMongoRepository: PhoneOTPMongoRepository,
    private customExceptionService: CustomExceptionService,
  ) { 
    super(phoneOTPMongoRepository);
  }
}
