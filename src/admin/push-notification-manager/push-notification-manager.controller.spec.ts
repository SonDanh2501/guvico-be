import { Test, TestingModule } from '@nestjs/testing';
import { PushNotificationManagerController } from './push-notification-manager.controller';

describe('PushNotificationManagerController', () => {
  let controller: PushNotificationManagerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PushNotificationManagerController],
    }).compile();

    controller = module.get<PushNotificationManagerController>(PushNotificationManagerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
