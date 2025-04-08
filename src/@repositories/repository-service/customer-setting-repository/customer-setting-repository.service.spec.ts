import { Test, TestingModule } from '@nestjs/testing';
import { CustomerSettingRepositoryService } from './customer-setting-repository.service';

describe('CustomerSettingRepositoryService', () => {
  let service: CustomerSettingRepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomerSettingRepositoryService],
    }).compile();

    service = module.get<CustomerSettingRepositoryService>(CustomerSettingRepositoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
