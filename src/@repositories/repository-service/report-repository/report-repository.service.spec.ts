import { Test, TestingModule } from '@nestjs/testing';
import { ReportRepositoryService } from './report-repository.service';

describe('ReportRepositoryService', () => {
  let service: ReportRepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReportRepositoryService],
    }).compile();

    service = module.get<ReportRepositoryService>(ReportRepositoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
