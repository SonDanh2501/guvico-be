import { Test, TestingModule } from '@nestjs/testing';
import { GroupCustomerOopSystemService } from './group-customer-oop-system.service';

describe('GroupCustomerOopSystemService', () => {
  let service: GroupCustomerOopSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupCustomerOopSystemService],
    }).compile();

    service = module.get<GroupCustomerOopSystemService>(GroupCustomerOopSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
