import { Test, TestingModule } from '@nestjs/testing';
import { CustomerOopSystemService } from './customer-oop-system.service';

describe('CustomerOopSystemService', () => {
  let service: CustomerOopSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomerOopSystemService],
    }).compile();

    service = module.get<CustomerOopSystemService>(CustomerOopSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
