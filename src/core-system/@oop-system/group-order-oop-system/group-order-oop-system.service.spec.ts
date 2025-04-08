import { Test, TestingModule } from '@nestjs/testing';
import { GroupOrderOopSystemService } from './group-order-oop-system.service';

describe('GroupOrderOopSystemService', () => {
  let service: GroupOrderOopSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupOrderOopSystemService],
    }).compile();

    service = module.get<GroupOrderOopSystemService>(GroupOrderOopSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
