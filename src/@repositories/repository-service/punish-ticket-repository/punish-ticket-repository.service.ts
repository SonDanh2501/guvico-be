import { Injectable } from '@nestjs/common';
import { BaseRepositoryService } from 'src/@repositories/repository-service/@base-repository/base-repository.abstract.service';
import { BaseRepositoryInterfaceService } from 'src/@repositories/repository-service/@base-repository/base-repository.interface.service';
import { PunishTicketMongoRepository } from 'src/@repositories/module/mongodb/repository/punish-ticket.mongo.repository';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';


@Injectable()
export class PunishTicketRepositoryService extends BaseRepositoryService implements BaseRepositoryInterfaceService {
    constructor(
        private customerExceptionService:CustomExceptionService,
        private punishTicketRepository:PunishTicketMongoRepository,
    ){
        super(punishTicketRepository);
    }
}
