import { Test, TestingModule } from '@nestjs/testing';
import { HistoryOrderSystemService } from './history-order-system.service';

describe('HistoryOrderSystemService', () => {
  let service: HistoryOrderSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HistoryOrderSystemService],
    }).compile();

    service = module.get<HistoryOrderSystemService>(HistoryOrderSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
