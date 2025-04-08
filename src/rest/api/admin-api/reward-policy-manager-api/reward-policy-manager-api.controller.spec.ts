import { Test, TestingModule } from '@nestjs/testing';
import { RewardPolicyManagerApiController } from './reward-policy-manager-api.controller';

describe('RewardPolicyManagerApiController', () => {
  let controller: RewardPolicyManagerApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RewardPolicyManagerApiController],
    }).compile();

    controller = module.get<RewardPolicyManagerApiController>(RewardPolicyManagerApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
