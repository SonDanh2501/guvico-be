import { Test, TestingModule } from '@nestjs/testing';
import { RandomReferralCodeSystemService } from './random-referral-code-system.service';

describe('RandomReferralCodeSystemService', () => {
  let service: RandomReferralCodeSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RandomReferralCodeSystemService],
    }).compile();

    service = module.get<RandomReferralCodeSystemService>(RandomReferralCodeSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
