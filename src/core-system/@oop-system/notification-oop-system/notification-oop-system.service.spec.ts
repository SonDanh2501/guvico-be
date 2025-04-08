import { Test, TestingModule } from '@nestjs/testing';
import { NotificationOopSystemService } from './notification-oop-system.service';

describe('NotificationOopSystemService', () => {
  let service: NotificationOopSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationOopSystemService],
    }).compile();

    service = module.get<NotificationOopSystemService>(NotificationOopSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
