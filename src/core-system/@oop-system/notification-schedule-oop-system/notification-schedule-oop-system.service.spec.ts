import { Test, TestingModule } from '@nestjs/testing';
import { NotificationScheduleOopSystemService } from './notification-schedule-oop-system.service';

describe('NotificationScheduleOopSystemService', () => {
  let service: NotificationScheduleOopSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationScheduleOopSystemService],
    }).compile();

    service = module.get<NotificationScheduleOopSystemService>(NotificationScheduleOopSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
