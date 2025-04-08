import { Test, TestingModule } from '@nestjs/testing';
import { CustomerSystemService } from './customer-system.service';

describe('CustomerSystemService', () => {
  let service: CustomerSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomerSystemService],
    }).compile();

    service = module.get<CustomerSystemService>(CustomerSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
