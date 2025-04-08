import { Test, TestingModule } from '@nestjs/testing';
import { ReportManangerService } from './report-mananger.service';

describe('ReportManangerService', () => {
  let service: ReportManangerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReportManangerService],
    }).compile();

    service = module.get<ReportManangerService>(ReportManangerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
