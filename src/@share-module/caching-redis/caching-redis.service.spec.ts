import { Test, TestingModule } from '@nestjs/testing';
import { CachingRedisService } from './caching-redis.service';

describe('CachingRedisService', () => {
  let service: CachingRedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CachingRedisService],
    }).compile();

    service = module.get<CachingRedisService>(CachingRedisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
