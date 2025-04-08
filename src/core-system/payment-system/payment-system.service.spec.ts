import { Test, TestingModule } from '@nestjs/testing';
import { PaymentSystemService } from './payment-system.service';

describe('PaymentSystemService', () => {
  let service: PaymentSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentSystemService],
    }).compile();

    service = module.get<PaymentSystemService>(PaymentSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
