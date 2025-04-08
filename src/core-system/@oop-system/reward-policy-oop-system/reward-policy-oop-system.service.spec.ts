import { Test, TestingModule } from '@nestjs/testing';
import { RewardPolicyOopSystemService } from './reward-policy-oop-system.service';

describe('RewardPolicyOopSystemService', () => {
  let service: RewardPolicyOopSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RewardPolicyOopSystemService],
    }).compile();

    service = module.get<RewardPolicyOopSystemService>(RewardPolicyOopSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
