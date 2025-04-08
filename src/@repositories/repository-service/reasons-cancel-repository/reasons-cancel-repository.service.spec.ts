import { Test, TestingModule } from '@nestjs/testing';
import { ReasonsCancelRepositoryService } from './reasons-cancel-repository.service';

describe('ReasonsCancelRepositoryService', () => {
  let service: ReasonsCancelRepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReasonsCancelRepositoryService],
    }).compile();

    service = module.get<ReasonsCancelRepositoryService>(ReasonsCancelRepositoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
