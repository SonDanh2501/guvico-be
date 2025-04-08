import { Test, TestingModule } from '@nestjs/testing';
import { OrderSchedulerService } from './order-scheduler.service';

describe('OrderSchedulerService', () => {
  let service: OrderSchedulerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderSchedulerService],
    }).compile();

    service = module.get<OrderSchedulerService>(OrderSchedulerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
