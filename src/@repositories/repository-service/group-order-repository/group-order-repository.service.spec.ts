import { Test, TestingModule } from '@nestjs/testing';
import { GroupOrderRepositoryService } from './group-order-repository.service';

describe('GroupOrderRepositoryService', () => {
  let service: GroupOrderRepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupOrderRepositoryService],
    }).compile();

    service = module.get<GroupOrderRepositoryService>(GroupOrderRepositoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
