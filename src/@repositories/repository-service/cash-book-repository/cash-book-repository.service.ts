import { Injectable } from '@nestjs/common';
import { BaseRepositoryService } from 'src/@repositories/repository-service/@base-repository/base-repository.abstract.service';
import { BaseRepositoryInterfaceService } from 'src/@repositories/repository-service/@base-repository/base-repository.interface.service';
import { CashBookMongoRepository } from 'src/@repositories/module/mongodb/repository/cash-book.mongo.repository';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';

@Injectable()
export class CashBookRepositoryService extends BaseRepositoryService implements BaseRepositoryInterfaceService {
    constructor(
        private cashBookMongoRepository: CashBookMongoRepository,
        private customExceptionService: CustomExceptionService,
    ) {
        super(cashBookMongoRepository);
    }
}
