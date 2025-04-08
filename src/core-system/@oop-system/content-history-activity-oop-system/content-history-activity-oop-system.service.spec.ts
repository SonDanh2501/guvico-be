import { Test, TestingModule } from '@nestjs/testing';
import { ContentHistoryActivityOopSystemService } from './content-history-activity-oop-system.service';

describe('ContentHistoryActivityOopSystemService', () => {
  let service: ContentHistoryActivityOopSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContentHistoryActivityOopSystemService],
    }).compile();

    service = module.get<ContentHistoryActivityOopSystemService>(ContentHistoryActivityOopSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
