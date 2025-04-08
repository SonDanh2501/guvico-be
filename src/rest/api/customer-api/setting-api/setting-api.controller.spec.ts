import { Test, TestingModule } from '@nestjs/testing';
import { SettingApiController } from './setting-api.controller';

describe('SettingApiController', () => {
  let controller: SettingApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SettingApiController],
    }).compile();

    controller = module.get<SettingApiController>(SettingApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
