import { Test, TestingModule } from '@nestjs/testing';
import { RewardPolicyRepositoryService } from './reward-policy-repository.service';

describe('RewardPolicyRepositoryService', () => {
  let service: RewardPolicyRepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RewardPolicyRepositoryService],
    }).compile();

    service = module.get<RewardPolicyRepositoryService>(RewardPolicyRepositoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
