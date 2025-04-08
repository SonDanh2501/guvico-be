import { Test, TestingModule } from '@nestjs/testing';
import { ContentHistoryActivitySystemService } from './content-history-activity-system.service';

describe('ContentHistoryActivitySystemService', () => {
  let service: ContentHistoryActivitySystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContentHistoryActivitySystemService],
    }).compile();

    service = module.get<ContentHistoryActivitySystemService>(ContentHistoryActivitySystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
