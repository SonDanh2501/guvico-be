import { Test, TestingModule } from '@nestjs/testing';
import { JobSystemService } from './job-system.service';

describe('JobSystemService', () => {
  let service: JobSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JobSystemService],
    }).compile();

    service = module.get<JobSystemService>(JobSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
