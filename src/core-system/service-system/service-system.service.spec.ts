import { Test, TestingModule } from '@nestjs/testing';
import { ServiceSystemService } from './service-system.service';

describe('ServiceSystemService', () => {
  let service: ServiceSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServiceSystemService],
    }).compile();

    service = module.get<ServiceSystemService>(ServiceSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
