import { Test, TestingModule } from '@nestjs/testing';
import { GroupOrderSystemService } from './group-order-system.service';

describe('GroupOrderSystemService', () => {
  let service: GroupOrderSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupOrderSystemService],
    }).compile();

    service = module.get<GroupOrderSystemService>(GroupOrderSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
