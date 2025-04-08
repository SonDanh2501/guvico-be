import { collaboratorRedisSchema } from '../@database';
import { CollaboratorRedisRepositoryInterface } from '../interface';
import { BaseRedisRepositoryAbstract } from './base.redis.repository.abstract';

export class CollaboratorRedisRepository extends BaseRedisRepositoryAbstract implements CollaboratorRedisRepositoryInterface
{
    constructor() {
        super(collaboratorRedisSchema);
    }
}
