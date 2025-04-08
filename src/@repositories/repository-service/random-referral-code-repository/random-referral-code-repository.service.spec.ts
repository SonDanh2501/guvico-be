import { Test, TestingModule } from '@nestjs/testing';
import { RandomReferralCodeRepositoryService } from './random-referral-code-repository.service';

describe('RandomReferralCodeRepositoryService', () => {
  let service: RandomReferralCodeRepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RandomReferralCodeRepositoryService],
    }).compile();

    service = module.get<RandomReferralCodeRepositoryService>(RandomReferralCodeRepositoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
