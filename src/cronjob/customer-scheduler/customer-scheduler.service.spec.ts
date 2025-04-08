import { Test, TestingModule } from '@nestjs/testing';
import { CustomerSchedulerService } from './customer-scheduler.service';

describe('CustomerSchedulerService', () => {
  let service: CustomerSchedulerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomerSchedulerService],
    }).compile();

    service = module.get<CustomerSchedulerService>(CustomerSchedulerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
