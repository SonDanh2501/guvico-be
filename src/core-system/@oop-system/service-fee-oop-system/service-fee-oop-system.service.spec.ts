import { Test, TestingModule } from '@nestjs/testing';
import { ServiceFeeOopSystemService } from './service-fee-oop-system.service';

describe('ServiceFeeOopSystemService', () => {
  let service: ServiceFeeOopSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServiceFeeOopSystemService],
    }).compile();

    service = module.get<ServiceFeeOopSystemService>(ServiceFeeOopSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
