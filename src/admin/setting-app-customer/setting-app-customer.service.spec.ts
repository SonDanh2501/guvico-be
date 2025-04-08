import { Test, TestingModule } from '@nestjs/testing';
import { SettingAppCustomerService } from './setting-app-customer.service';

describe('SettingAppCustomerService', () => {
  let service: SettingAppCustomerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SettingAppCustomerService],
    }).compile();

    service = module.get<SettingAppCustomerService>(SettingAppCustomerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
