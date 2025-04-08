import { Test, TestingModule } from '@nestjs/testing';
import { ConditionAutomationRepositoryService } from './condition-automation-repository.service';

describe('ConditionAutomationRepositoryService', () => {
  let service: ConditionAutomationRepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConditionAutomationRepositoryService],
    }).compile();

    service = module.get<ConditionAutomationRepositoryService>(ConditionAutomationRepositoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
