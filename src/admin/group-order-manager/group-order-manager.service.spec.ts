import { Test, TestingModule } from '@nestjs/testing';
import { GroupOrderManagerService } from './group-order-manager.service';

describe('GroupOrderManagerService', () => {
  let service: GroupOrderManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupOrderManagerService],
    }).compile();

    service = module.get<GroupOrderManagerService>(GroupOrderManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
