import { Test, TestingModule } from '@nestjs/testing';
import { AutomationOopSystemService } from './automation-oop-system.service';

describe('AutomationOopSystemService', () => {
  let service: AutomationOopSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AutomationOopSystemService],
    }).compile();

    service = module.get<AutomationOopSystemService>(AutomationOopSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
