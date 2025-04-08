import { Test, TestingModule } from '@nestjs/testing';
import { SettingManagerApiController } from './setting-manager-api.controller';

describe('SettingManagerApiController', () => {
  let controller: SettingManagerApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SettingManagerApiController],
    }).compile();

    controller = module.get<SettingManagerApiController>(SettingManagerApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
