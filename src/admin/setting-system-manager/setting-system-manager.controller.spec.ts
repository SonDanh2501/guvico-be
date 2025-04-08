import { Test, TestingModule } from '@nestjs/testing';
import { SettingSystemManagerController } from './setting-system-manager.controller';

describe('SettingSystemManagerController', () => {
  let controller: SettingSystemManagerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SettingSystemManagerController],
    }).compile();

    controller = module.get<SettingSystemManagerController>(SettingSystemManagerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
