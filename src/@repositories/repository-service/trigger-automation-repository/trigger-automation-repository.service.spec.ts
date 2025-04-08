import { Test, TestingModule } from '@nestjs/testing';
import { TriggerAutomationRepositoryService } from './trigger-automation-repository.service';

describe('TriggerAutomationRepositoryService', () => {
  let service: TriggerAutomationRepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TriggerAutomationRepositoryService],
    }).compile();

    service = module.get<TriggerAutomationRepositoryService>(TriggerAutomationRepositoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
