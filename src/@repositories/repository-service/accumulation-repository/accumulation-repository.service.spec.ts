import { Test, TestingModule } from '@nestjs/testing';
import { AccumulationRepositoryService } from './accumulation-repository.service';

describe('AccumulationRepositoryService', () => {
  let service: AccumulationRepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccumulationRepositoryService],
    }).compile();

    service = module.get<AccumulationRepositoryService>(AccumulationRepositoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
