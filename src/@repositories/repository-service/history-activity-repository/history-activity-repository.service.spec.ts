import { Test, TestingModule } from '@nestjs/testing';
import { HistoryActivityRepositoryService } from './history-activity-repository.service';

describe('HistoryActivityRepositoryService', () => {
  let service: HistoryActivityRepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HistoryActivityRepositoryService],
    }).compile();

    service = module.get<HistoryActivityRepositoryService>(HistoryActivityRepositoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
