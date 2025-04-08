import { Test, TestingModule } from '@nestjs/testing';
import { HandleLogicSystemService } from './handle-logic-system.service';

describe('HandleLogicSystemService', () => {
  let service: HandleLogicSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HandleLogicSystemService],
    }).compile();

    service = module.get<HandleLogicSystemService>(HandleLogicSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
