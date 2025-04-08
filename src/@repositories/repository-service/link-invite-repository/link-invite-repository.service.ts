import { Injectable } from '@nestjs/common';
import { BaseRepositoryService } from '../@base-repository/base-repository.abstract.service';
import { BaseRepositoryInterfaceService } from '../@base-repository/base-repository.interface.service';
import { LinkInviteMongoRepository } from 'src/@repositories/module/mongodb/repository/link-invite.mongo.repository';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';

@Injectable()
export class LinkInviteRepositoryService  extends BaseRepositoryService implements BaseRepositoryInterfaceService {
    constructor(
        private linkInviteMongoRepository: LinkInviteMongoRepository,
        private customExceptionService: CustomExceptionService,
    ) {
        super(linkInviteMongoRepository);
    }
}
