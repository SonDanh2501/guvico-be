import { Test, TestingModule } from '@nestjs/testing';
import { TransitionCustomerService } from './transition-customer.service';

describe('TransitionCustomerService', () => {
  let service: TransitionCustomerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransitionCustomerService],
    }).compile();

    service = module.get<TransitionCustomerService>(TransitionCustomerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
