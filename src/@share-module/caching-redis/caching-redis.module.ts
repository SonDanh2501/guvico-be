import { Module } from '@nestjs/common';
import { CachingRedisService } from './caching-redis.service';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisClientOptions } from 'redis';
import * as redisStore from 'cache-manager-ioredis'
export const redisConfig = {
    host: 'localhost',
    port: 6377,
    // password: 'your_redis_password',
  }


@Module({
    imports: [
        CacheModule.register<RedisClientOptions>({
                store: redisStore,
                socket: {
                  host: redisConfig.host,
                  port: redisConfig.port
                }
        })
    ],
    providers: [
        CachingRedisService
    ],
    exports: [
        CachingRedisService
    ]
})
export class CachingRedisModule { }
