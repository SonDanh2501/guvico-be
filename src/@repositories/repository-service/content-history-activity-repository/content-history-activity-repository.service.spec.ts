import { Test, TestingModule } from '@nestjs/testing';
import { ContentHistoryActivityRepositoryService } from './content-history-activity-repository.service';

describe('ContentHistoryActivityRepositoryService', () => {
  let service: ContentHistoryActivityRepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContentHistoryActivityRepositoryService],
    }).compile();

    service = module.get<ContentHistoryActivityRepositoryService>(ContentHistoryActivityRepositoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
