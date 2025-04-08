import { customerRedisSchema } from '../@database';
import { CustomerRedisRepositoryInterface } from '../interface';
import { BaseRedisRepositoryAbstract } from './base.redis.repository.abstract';

export class CustomerRedisRepository extends BaseRedisRepositoryAbstract implements CustomerRedisRepositoryInterface
{
    constructor() {
        super(customerRedisSchema);
    }
}
