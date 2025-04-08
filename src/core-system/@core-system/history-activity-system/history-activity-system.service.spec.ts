import { Test, TestingModule } from '@nestjs/testing';
import { HistoryActivitySystemService } from './history-activity-system.service';

describe('HistoryActivitySystemService', () => {
  let service: HistoryActivitySystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HistoryActivitySystemService],
    }).compile();

    service = module.get<HistoryActivitySystemService>(HistoryActivitySystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
