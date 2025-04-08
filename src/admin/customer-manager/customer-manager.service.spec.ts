import { Test, TestingModule } from '@nestjs/testing';
import { CustomerManagerService } from './customer-manager.service';

describe('CustomerManagerService', () => {
  let service: CustomerManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomerManagerService],
    }).compile();

    service = module.get<CustomerManagerService>(CustomerManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
