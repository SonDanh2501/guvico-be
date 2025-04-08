import { groupOrderRedisSchema } from '../@database';
import { GroupOrderRedisRepositoryInterface } from '../interface';
import { BaseRedisRepositoryAbstract } from './base.redis.repository.abstract';

export class GroupOrderRedisRepository extends BaseRedisRepositoryAbstract implements GroupOrderRedisRepositoryInterface
{
    constructor() {
        super(groupOrderRedisSchema);
    }
}
