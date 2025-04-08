import { Test, TestingModule } from '@nestjs/testing';
import { GroupCustomerSystemService } from './group-customer-system.service';

describe('GroupCustomerSystemService', () => {
  let service: GroupCustomerSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupCustomerSystemService],
    }).compile();

    service = module.get<GroupCustomerSystemService>(GroupCustomerSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
