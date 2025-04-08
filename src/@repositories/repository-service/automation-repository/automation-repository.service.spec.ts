import { Test, TestingModule } from '@nestjs/testing';
import { AutomationRepositoryService } from './automation-repository.service';

describe('AutomationRepositoryService', () => {
  let service: AutomationRepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AutomationRepositoryService],
    }).compile();

    service = module.get<AutomationRepositoryService>(AutomationRepositoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
