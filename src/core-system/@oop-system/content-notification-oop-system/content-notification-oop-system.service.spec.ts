import { Test, TestingModule } from '@nestjs/testing';
import { ContentNotificationOopSystemService } from './content-notification-oop-system.service';

describe('ContentNotificationOopSystemService', () => {
  let service: ContentNotificationOopSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContentNotificationOopSystemService],
    }).compile();

    service = module.get<ContentNotificationOopSystemService>(ContentNotificationOopSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
