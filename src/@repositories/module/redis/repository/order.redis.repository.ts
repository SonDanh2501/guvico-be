import { orderRedisSchema } from '../@database';
import { OrderRedisRepositoryInterface } from '../interface';
import { BaseRedisRepositoryAbstract } from './base.redis.repository.abstract';

export class OrderRedisRepository extends BaseRedisRepositoryAbstract implements OrderRedisRepositoryInterface
{
    constructor() {
        super(orderRedisSchema);
    }
}
