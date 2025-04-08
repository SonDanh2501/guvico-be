import { Test, TestingModule } from '@nestjs/testing';
import { ContentNotificationSystemService } from './content-notification-system.service';

describe('ContentNotificationSystemService', () => {
  let service: ContentNotificationSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContentNotificationSystemService],
    }).compile();

    service = module.get<ContentNotificationSystemService>(ContentNotificationSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
