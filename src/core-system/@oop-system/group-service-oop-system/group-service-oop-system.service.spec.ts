import { Test, TestingModule } from '@nestjs/testing';
import { GroupServiceOopSystemService } from './group-service-oop-system.service';

describe('GroupServiceOopSystemService', () => {
  let service: GroupServiceOopSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupServiceOopSystemService],
    }).compile();

    service = module.get<GroupServiceOopSystemService>(GroupServiceOopSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
