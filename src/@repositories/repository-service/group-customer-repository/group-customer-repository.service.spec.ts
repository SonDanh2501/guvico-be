import { Test, TestingModule } from '@nestjs/testing';
import { GroupCustomerRepositoryService } from './group-customer-repository.service';

describe('GroupCustomerRepositoryService', () => {
  let service: GroupCustomerRepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupCustomerRepositoryService],
    }).compile();

    service = module.get<GroupCustomerRepositoryService>(GroupCustomerRepositoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
