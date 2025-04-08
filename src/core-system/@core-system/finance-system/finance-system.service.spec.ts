import { Test, TestingModule } from '@nestjs/testing';
import { FinanceSystemService } from './finance-system.service';

describe('FinanceSystemService', () => {
  let service: FinanceSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FinanceSystemService],
    }).compile();

    service = module.get<FinanceSystemService>(FinanceSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
