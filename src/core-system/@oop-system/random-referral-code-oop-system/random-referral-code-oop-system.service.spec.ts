import { Test, TestingModule } from '@nestjs/testing';
import { RandomReferralCodeOopSystemService } from './random-referral-code-oop-system.service';

describe('RandomReferralCodeOopSystemService', () => {
  let service: RandomReferralCodeOopSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RandomReferralCodeOopSystemService],
    }).compile();

    service = module.get<RandomReferralCodeOopSystemService>(RandomReferralCodeOopSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
