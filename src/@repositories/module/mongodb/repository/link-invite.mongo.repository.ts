// import { BaseEntity } from '@modules/shared/base/base.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseMongoRepositoryAbstract } from './base.mongo.repository.abstract';
import { LinkInvite } from '../@database/schema/link_invite.schema';
import { LinkInviteRepositoryInterface } from '../interface';

export class LinkInviteMongoRepository extends BaseMongoRepositoryAbstract<LinkInvite> implements  LinkInviteRepositoryInterface {
    constructor(
        @InjectModel(LinkInvite.name)
        private readonly repository: Model<LinkInvite>,
    ) {
        super(repository);
    }
}
