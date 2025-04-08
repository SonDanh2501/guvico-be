import { Test, TestingModule } from '@nestjs/testing'
import { PushNotificationSystemService } from './push-notification-system.service'

describe('PushNotificationSystemService', () => {
  let service: PushNotificationSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PushNotificationSystemService],
    }).compile();

    service = module.get<PushNotificationSystemService>(PushNotificationSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
