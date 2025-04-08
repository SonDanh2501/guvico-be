import { Test, TestingModule } from '@nestjs/testing';
import { GroupServiceSystemService } from './group-service-system.service';

describe('GroupServiceSystemService', () => {
  let service: GroupServiceSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupServiceSystemService],
    }).compile();

    service = module.get<GroupServiceSystemService>(GroupServiceSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
