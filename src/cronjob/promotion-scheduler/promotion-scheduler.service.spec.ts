import { Test, TestingModule } from '@nestjs/testing';
import { PromotionSchedulerService } from './promotion-scheduler.service';

describe('PromotionSchedulerService', () => {
  let service: PromotionSchedulerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PromotionSchedulerService],
    }).compile();

    service = module.get<PromotionSchedulerService>(PromotionSchedulerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
