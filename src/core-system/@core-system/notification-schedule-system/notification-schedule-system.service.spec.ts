import { Test, TestingModule } from '@nestjs/testing';
import { NotificationScheduleSystemService } from './notification-schedule-system.service';

describe('NotificationScheduleSystemService', () => {
  let service: NotificationScheduleSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationScheduleSystemService],
    }).compile();

    service = module.get<NotificationScheduleSystemService>(NotificationScheduleSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
