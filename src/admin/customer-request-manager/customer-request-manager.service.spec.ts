import { Test, TestingModule } from '@nestjs/testing';
import { CustomerRequestManagerService } from './customer-request-manager.service';

describe('CustomerRequestManagerService', () => {
  let service: CustomerRequestManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomerRequestManagerService],
    }).compile();

    service = module.get<CustomerRequestManagerService>(CustomerRequestManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
