import { Test, TestingModule } from '@nestjs/testing';
import { TransactionSystemService } from './transaction-system.service';

describe('TransactionSystemService', () => {
  let service: TransactionSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransactionSystemService],
    }).compile();

    service = module.get<TransactionSystemService>(TransactionSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
