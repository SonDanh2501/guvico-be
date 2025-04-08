import { Test, TestingModule } from '@nestjs/testing';
import { OptionalServiceRepositoryService } from './optional-service-repository.service';

describe('OptionalServiceRepositoryService', () => {
  let service: OptionalServiceRepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OptionalServiceRepositoryService],
    }).compile();

    service = module.get<OptionalServiceRepositoryService>(OptionalServiceRepositoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
