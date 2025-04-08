import { Test, TestingModule } from '@nestjs/testing';
import { ActivityCustomerSystemService } from './activity-customer-system.service';

describe('ActivityCustomerSystemService', () => {
  let service: ActivityCustomerSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActivityCustomerSystemService],
    }).compile();

    service = module.get<ActivityCustomerSystemService>(ActivityCustomerSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
