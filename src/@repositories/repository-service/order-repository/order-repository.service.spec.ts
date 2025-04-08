import { Test, TestingModule } from '@nestjs/testing';
import { OrderRepositoryService } from './order-repository.service';

describe('OrderRepositoryService', () => {
  let service: OrderRepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderRepositoryService],
    }).compile();

    service = module.get<OrderRepositoryService>(OrderRepositoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
