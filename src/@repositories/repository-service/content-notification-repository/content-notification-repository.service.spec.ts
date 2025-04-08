import { Test, TestingModule } from '@nestjs/testing';
import { ContentNotificationRepositoryService } from './content-notification-repository.service';

describe('ContentNotificationRepositoryService', () => {
  let service: ContentNotificationRepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContentNotificationRepositoryService],
    }).compile();

    service = module.get<ContentNotificationRepositoryService>(ContentNotificationRepositoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
