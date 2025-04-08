import { Test, TestingModule } from '@nestjs/testing';
import { OptionalServiceOopSystemService } from './optional-service-oop-system.service';

describe('OptionalServiceOopSystemService', () => {
  let service: OptionalServiceOopSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OptionalServiceOopSystemService],
    }).compile();

    service = module.get<OptionalServiceOopSystemService>(OptionalServiceOopSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
