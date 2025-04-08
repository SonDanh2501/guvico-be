import { Test, TestingModule } from '@nestjs/testing';
import { AccumulationSystemService } from './accumulation-system.service';

describe('AccumulationSystemService', () => {
  let service: AccumulationSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccumulationSystemService],
    }).compile();

    service = module.get<AccumulationSystemService>(AccumulationSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
