import { Injectable } from '@nestjs/common'
import { ReportMongoRepository } from 'src/@repositories/module/mongodb/repository/report.mongo.repository'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
import { BaseRepositoryService } from '../@base-repository/base-repository.abstract.service'
import { BaseRepositoryInterfaceService } from '../@base-repository/base-repository.interface.service'

@Injectable()
export class ReportRepositoryService extends BaseRepositoryService implements BaseRepositoryInterfaceService {
    constructor(
      private reportMongoRepository: ReportMongoRepository,
      private customExceptionService: CustomExceptionService,
    ) { 
      super(reportMongoRepository);
    }
  }
