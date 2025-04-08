import { Test, TestingModule } from '@nestjs/testing';
import { ReasonPunishManagerController } from './reason-punish-manager.controller';

describe('ReasonPunishManagerController', () => {
  let controller: ReasonPunishManagerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReasonPunishManagerController],
    }).compile();

    controller = module.get<ReasonPunishManagerController>(ReasonPunishManagerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
