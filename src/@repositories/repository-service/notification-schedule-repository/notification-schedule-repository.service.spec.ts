import { Test, TestingModule } from '@nestjs/testing';
import { NotificationScheduleRepositoryService } from './notification-schedule-repository.service';

describe('NotificationScheduleRepositoryService', () => {
  let service: NotificationScheduleRepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationScheduleRepositoryService],
    }).compile();

    service = module.get<NotificationScheduleRepositoryService>(NotificationScheduleRepositoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
