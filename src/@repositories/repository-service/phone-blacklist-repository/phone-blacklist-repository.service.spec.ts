import { Test, TestingModule } from '@nestjs/testing';
import { PhoneBlacklistRepositoryService } from './phone-blacklist-repository.service';

describe('PhoneBlacklistRepositoryService', () => {
  let service: PhoneBlacklistRepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PhoneBlacklistRepositoryService],
    }).compile();

    service = module.get<PhoneBlacklistRepositoryService>(PhoneBlacklistRepositoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
