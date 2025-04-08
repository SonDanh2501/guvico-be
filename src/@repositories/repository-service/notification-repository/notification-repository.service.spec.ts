import { Test, TestingModule } from '@nestjs/testing';
import { NotificationRepositoryService } from './notification-repository.service';

describe('NotificationRepositoryService', () => {
  let service: NotificationRepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationRepositoryService],
    }).compile();

    service = module.get<NotificationRepositoryService>(NotificationRepositoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
