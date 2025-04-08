import { Test, TestingModule } from '@nestjs/testing';
import { TransactionOopSystemService } from './transaction-oop-system.service';

describe('TransactionOopSystemService', () => {
  let service: TransactionOopSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransactionOopSystemService],
    }).compile();

    service = module.get<TransactionOopSystemService>(TransactionOopSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
