import { Test, TestingModule } from '@nestjs/testing';
import { GroupServiceRepositoryService } from './group-service-repository.service';

describe('GroupServiceRepositoryService', () => {
  let service: GroupServiceRepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupServiceRepositoryService],
    }).compile();

    service = module.get<GroupServiceRepositoryService>(GroupServiceRepositoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
