import { Injectable } from '@nestjs/common';
import { BaseRepositoryService } from 'src/@repositories/repository-service/@base-repository/base-repository.abstract.service';
import { BaseRepositoryInterfaceService } from 'src/@repositories/repository-service/@base-repository/base-repository.interface.service';
import { ReasonCancelMongoRepository } from 'src/@repositories/module/mongodb/repository/reason-cancel.mong.repository';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';

@Injectable()
export class ReasonsCancelRepositoryService extends BaseRepositoryService implements BaseRepositoryInterfaceService{
    constructor(
        private reasonCancelsRepository: ReasonCancelMongoRepository,
        private customExceptionService: CustomExceptionService,

    ){
        super(reasonCancelsRepository);
    }
}
