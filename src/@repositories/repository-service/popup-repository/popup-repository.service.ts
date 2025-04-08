import { Injectable } from '@nestjs/common';
import { BaseRepositoryService } from '../@base-repository/base-repository.abstract.service';
import { BaseRepositoryInterfaceService } from '../@base-repository/base-repository.interface.service';
import { PopupMongoRepository } from 'src/@repositories/module/mongodb/repository/popup.mongo.repository';

@Injectable()
export class PopupRepositoryService extends BaseRepositoryService implements BaseRepositoryInterfaceService{
    constructor(
        private popupMongoRepository: PopupMongoRepository,
    ) {
        super(popupMongoRepository)
    }
}
