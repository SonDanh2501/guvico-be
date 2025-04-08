import { Test, TestingModule } from '@nestjs/testing';
import { ReportOopSystemService } from './report-oop-system.service';

describe('ReportOopSystemService', () => {
  let service: ReportOopSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReportOopSystemService],
    }).compile();

    service = module.get<ReportOopSystemService>(ReportOopSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
