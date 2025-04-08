import { Test, TestingModule } from '@nestjs/testing';
import { NotificationScheduleManagerApiController } from './notification-schedule-manager-api.controller';

describe('NotificationScheduleManagerApiController', () => {
  let controller: NotificationScheduleManagerApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationScheduleManagerApiController],
    }).compile();

    controller = module.get<NotificationScheduleManagerApiController>(NotificationScheduleManagerApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
