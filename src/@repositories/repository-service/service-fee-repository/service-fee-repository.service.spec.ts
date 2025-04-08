import { Test, TestingModule } from '@nestjs/testing';
import { ServiceFeeRepositoryService } from './service-fee-repository.service';

describe('ServiceFeeRepositoryService', () => {
  let service: ServiceFeeRepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServiceFeeRepositoryService],
    }).compile();

    service = module.get<ServiceFeeRepositoryService>(ServiceFeeRepositoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
