import { Test, TestingModule } from '@nestjs/testing';
import { TransitionSchedulerService } from './transition-scheduler.service';

describe('OrderSchedulerService', () => {
  let service: TransitionSchedulerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransitionSchedulerService],
    }).compile();

    service = module.get<TransitionSchedulerService>(TransitionSchedulerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
