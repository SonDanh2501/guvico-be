import { Test, TestingModule } from '@nestjs/testing';
import { FeedbackManagerService } from './feedback-manager.service';

describe('FeedbackManagerService', () => {
  let service: FeedbackManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FeedbackManagerService],
    }).compile();

    service = module.get<FeedbackManagerService>(FeedbackManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
