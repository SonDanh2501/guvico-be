import { userSystemRedisSchema } from '../@database/schema/user-system.schema';
import { UserSystemRedisRepositoryInterface } from '../interface/user-system.redis.interface';
import { BaseRedisRepositoryAbstract } from './base.redis.repository.abstract';

export class UserSystemRedisRepository extends BaseRedisRepositoryAbstract implements UserSystemRedisRepositoryInterface
{
    constructor() {
        super(userSystemRedisSchema);
    }
}
