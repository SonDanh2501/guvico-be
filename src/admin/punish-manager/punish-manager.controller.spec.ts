import { Test, TestingModule } from '@nestjs/testing';
import { PunishManagerController } from './punish-manager.controller';

describe('PunishManagerController', () => {
  let controller: PunishManagerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PunishManagerController],
    }).compile();

    controller = module.get<PunishManagerController>(PunishManagerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
