import { Test, TestingModule } from '@nestjs/testing';
import { CustomerRepositoryService } from './customer-repository.service';

describe('CustomerRepositoryService', () => {
  let service: CustomerRepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomerRepositoryService],
    }).compile();

    service = module.get<CustomerRepositoryService>(CustomerRepositoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
