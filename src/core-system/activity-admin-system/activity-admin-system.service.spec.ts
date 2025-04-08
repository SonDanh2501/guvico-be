import { Test, TestingModule } from '@nestjs/testing';
import { ActivityAdminSystemService } from './activity-admin-system.service';

describe('ActivityAdminSystemService', () => {
  let service: ActivityAdminSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActivityAdminSystemService],
    }).compile();

    service = module.get<ActivityAdminSystemService>(ActivityAdminSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
