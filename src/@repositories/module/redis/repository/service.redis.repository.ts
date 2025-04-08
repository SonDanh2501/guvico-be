import { serviceRedisSchema } from '../@database';
import { CustomerRedisRepositoryInterface, ServiceRedisRepositoryInterface } from '../interface';
import { BaseRedisRepositoryAbstract } from './base.redis.repository.abstract';

export class ServiceRedisRepository extends BaseRedisRepositoryAbstract implements ServiceRedisRepositoryInterface
{
    constructor() {
        super(serviceRedisSchema);
    }
}
