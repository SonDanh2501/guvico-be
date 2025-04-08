import { Test, TestingModule } from '@nestjs/testing';
import { AccumulationOopSystemService } from './accumulation-oop-system.service';

describe('AccumulationOopSystemService', () => {
  let service: AccumulationOopSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccumulationOopSystemService],
    }).compile();

    service = module.get<AccumulationOopSystemService>(AccumulationOopSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
