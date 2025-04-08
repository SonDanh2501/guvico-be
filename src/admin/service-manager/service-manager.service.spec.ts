import { Test, TestingModule } from '@nestjs/testing';
import { ServiceManagerService } from './service-manager.service';

describe('ServiceManagerService', () => {
  let service: ServiceManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServiceManagerService],
    }).compile();

    service = module.get<ServiceManagerService>(ServiceManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
