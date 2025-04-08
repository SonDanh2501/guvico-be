import { Test, TestingModule } from '@nestjs/testing';
import { PunishPolicyManagerApiController } from './punish-policy-manager-api.controller';

describe('PunishPolicyManagerApiController', () => {
  let controller: PunishPolicyManagerApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PunishPolicyManagerApiController],
    }).compile();

    controller = module.get<PunishPolicyManagerApiController>(PunishPolicyManagerApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
