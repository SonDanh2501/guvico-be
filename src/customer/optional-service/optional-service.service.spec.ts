import { Test, TestingModule } from '@nestjs/testing';
import { OptionalServiceService } from './optional-service.service';

describe('OptionalServiceService', () => {
  let service: OptionalServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OptionalServiceService],
    }).compile();

    service = module.get<OptionalServiceService>(OptionalServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
