import { Test, TestingModule } from '@nestjs/testing';
import { OrderOopSystemService } from './order-oop-system.service';

describe('OrderOopSystemService', () => {
  let service: OrderOopSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderOopSystemService],
    }).compile();

    service = module.get<OrderOopSystemService>(OrderOopSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
