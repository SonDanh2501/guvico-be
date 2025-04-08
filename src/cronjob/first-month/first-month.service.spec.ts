import { Test, TestingModule } from '@nestjs/testing';
import { FirstMonthService } from './first-month.service';

describe('FirstMonthService', () => {
  let service: FirstMonthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FirstMonthService],
    }).compile();

    service = module.get<FirstMonthService>(FirstMonthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
