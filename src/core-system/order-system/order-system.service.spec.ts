import { Test, TestingModule } from '@nestjs/testing';
import { OrderSystemService } from './order-system.service';

describe('OrderSystemService', () => {
  let service: OrderSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderSystemService],
    }).compile();

    service = module.get<OrderSystemService>(OrderSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
