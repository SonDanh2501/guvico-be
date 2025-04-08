import { Test, TestingModule } from '@nestjs/testing';
import { PushNotificationManagerService } from './push-notification-manager.service';

describe('PushNotificationManagerService', () => {
  let service: PushNotificationManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PushNotificationManagerService],
    }).compile();

    service = module.get<PushNotificationManagerService>(PushNotificationManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
