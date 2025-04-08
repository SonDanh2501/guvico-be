import { Test, TestingModule } from '@nestjs/testing';
import { HistoryPointService } from './history-point.service';

describe('HistoryPointService', () => {
  let service: HistoryPointService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HistoryPointService],
    }).compile();

    service = module.get<HistoryPointService>(HistoryPointService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
