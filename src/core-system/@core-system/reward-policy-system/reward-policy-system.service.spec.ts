import { Test, TestingModule } from '@nestjs/testing';
import { RewardPolicySystemService } from './reward-policy-system.service';

describe('RewardPolicySystemService', () => {
  let service: RewardPolicySystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RewardPolicySystemService],
    }).compile();

    service = module.get<RewardPolicySystemService>(RewardPolicySystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
