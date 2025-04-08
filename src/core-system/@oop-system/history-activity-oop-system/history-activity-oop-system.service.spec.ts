import { Test, TestingModule } from '@nestjs/testing';
import { HistoryActivityOopSystemService } from './history-activity-oop-system.service';

describe('HistoryActivityOopSystemService', () => {
  let service: HistoryActivityOopSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HistoryActivityOopSystemService],
    }).compile();

    service = module.get<HistoryActivityOopSystemService>(HistoryActivityOopSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
