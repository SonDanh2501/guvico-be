import { Test, TestingModule } from '@nestjs/testing';
import { ActivitySystemService } from './activity-system.service';

describe('ActivitySystemService', () => {
  let service: ActivitySystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActivitySystemService],
    }).compile();

    service = module.get<ActivitySystemService>(ActivitySystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
