import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisClientOptions } from 'redis';
import { CollaboratorRedisRepository } from './repository/collaborator.redis.repository';
import { CustomerRedisRepository } from './repository/customer.redis.repository';
import { ServiceRedisRepository } from './repository/service.redis.repository';
import { UserSystemRedisRepository } from './repository/user-system.redis.repository';
import { GroupOrderRedisRepository } from './repository/group-order.redis.repository';
import { OrderRedisRepository } from './repository/order.redis.repository';

@Module({
  imports: [
    // CacheModule.register<RedisClientOptions>({
    //   socket: {
    //     host: CONFIG_REDIS.host,
    //     port: CONFIG_REDIS.port
    //   },
    //   isGlobal: true, // this make module globally available
    //   ttl: 120000, // thoi gian cache ton tai tinh bang miliseconds, tuong ung voi 2 phut
    //   max: 1000 // gioi han so luong item luu tru trong cache de kiem soat tai nguyen RAM
    // }),
  ],
  providers: [
    CollaboratorRedisRepository,
    CustomerRedisRepository,
    ServiceRedisRepository,
    UserSystemRedisRepository,
    GroupOrderRedisRepository,
    OrderRedisRepository
  ],
  exports: [
    CollaboratorRedisRepository,
    CustomerRedisRepository,
    ServiceRedisRepository,
    UserSystemRedisRepository,
    GroupOrderRedisRepository,
    OrderRedisRepository
  ]
})
export class RedisModule { }
