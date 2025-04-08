import { Test, TestingModule } from '@nestjs/testing';
import { GroupCustomerMamagerService } from './group-customer-mamager.service';

describe('GroupCustomerMamagerService', () => {
  let service: GroupCustomerMamagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupCustomerMamagerService],
    }).compile();

    service = module.get<GroupCustomerMamagerService>(GroupCustomerMamagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
