import { Test, TestingModule } from '@nestjs/testing';
import { ReportSystemService } from './report-system.service';

describe('PunishTicketSystemService', () => {
  let service: ReportSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReportSystemService],
    }).compile();

    service = module.get<ReportSystemService>(ReportSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
