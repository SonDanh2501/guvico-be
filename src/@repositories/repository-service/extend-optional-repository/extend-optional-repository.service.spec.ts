import { Test, TestingModule } from '@nestjs/testing';
import { ExtendOptionalRepositoryService } from './extend-optional-repository.service';

describe('ExtendOptionalRepositoryService', () => {
  let service: ExtendOptionalRepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExtendOptionalRepositoryService],
    }).compile();

    service = module.get<ExtendOptionalRepositoryService>(ExtendOptionalRepositoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
