import { Injectable } from '@nestjs/common';
import { BaseRepositoryService } from '../@base-repository/base-repository.abstract.service';
import { BaseRepositoryInterfaceService } from '../@base-repository/base-repository.interface.service';
import { ExtendOptionalMongoRepository } from 'src/@repositories/module/mongodb/repository/extend-optional.mongo.repository';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';

@Injectable()
export class ExtendOptionalRepositoryService extends BaseRepositoryService implements BaseRepositoryInterfaceService {
    constructor(
        private extendOptionalMongoRepository: ExtendOptionalMongoRepository,
        private customExceptionService: CustomExceptionService,
    ) {
        super(extendOptionalMongoRepository)
    }
}
