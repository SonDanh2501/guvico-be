import { Test, TestingModule } from '@nestjs/testing';
import { CashBookRepositoryService } from './cash-book-repository.service';

describe('CashBookRepositoryService', () => {
  let service: CashBookRepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CashBookRepositoryService],
    }).compile();

    service = module.get<CashBookRepositoryService>(CashBookRepositoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
