import { Injectable } from '@nestjs/common';
import { BaseRepositoryService } from 'src/@repositories/repository-service/@base-repository/base-repository.abstract.service';
import { BaseRepositoryInterfaceService } from 'src/@repositories/repository-service/@base-repository/base-repository.interface.service';
import { TransactionMongoRepository } from 'src/@repositories/module/mongodb/repository/transaction.mongo.repository';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';

@Injectable()
export class TransactionRepositoryService extends BaseRepositoryService implements BaseRepositoryInterfaceService {
    constructor(
        private transactionMongoRepository: TransactionMongoRepository,
        private customExceptionService: CustomExceptionService
    ) {
        super(transactionMongoRepository);
    }
}
