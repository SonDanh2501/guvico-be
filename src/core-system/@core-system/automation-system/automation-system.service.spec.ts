import { Test, TestingModule } from '@nestjs/testing';
import { AutomationSystemService } from './automation-system.service';

describe('AutomationSystemService', () => {
  let service: AutomationSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AutomationSystemService],
    }).compile();

    service = module.get<AutomationSystemService>(AutomationSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
