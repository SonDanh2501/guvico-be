import { Test, TestingModule } from '@nestjs/testing';
import { CreateOrderQueueService } from './create-order-queue.service';

describe('CreateOrderQueueService', () => {
  let service: CreateOrderQueueService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CreateOrderQueueService],
    }).compile();

    service = module.get<CreateOrderQueueService>(CreateOrderQueueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
