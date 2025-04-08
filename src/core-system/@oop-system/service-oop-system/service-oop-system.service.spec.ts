import { Test, TestingModule } from '@nestjs/testing';
import { ServiceOopSystemService } from './service-oop-system.service';

describe('ServiceOopSystemService', () => {
  let service: ServiceOopSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServiceOopSystemService],
    }).compile();

    service = module.get<ServiceOopSystemService>(ServiceOopSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
