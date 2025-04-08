import { Test, TestingModule } from '@nestjs/testing';
import { SettingAppCustomerController } from './setting-app-customer.controller';

describe('SettingAppCustomerController', () => {
  let controller: SettingAppCustomerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SettingAppCustomerController],
    }).compile();

    controller = module.get<SettingAppCustomerController>(SettingAppCustomerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
