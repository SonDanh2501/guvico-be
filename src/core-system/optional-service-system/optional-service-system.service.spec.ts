import { Test, TestingModule } from '@nestjs/testing';
import { OptionalServiceSystemService } from './optional-service-system.service';

describe('OptionalServiceSystemService', () => {
  let service: OptionalServiceSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OptionalServiceSystemService],
    }).compile();

    service = module.get<OptionalServiceSystemService>(OptionalServiceSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
