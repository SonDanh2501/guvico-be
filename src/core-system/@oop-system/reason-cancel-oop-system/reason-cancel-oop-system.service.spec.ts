import { Test, TestingModule } from '@nestjs/testing';
import { ReasonCancelOopSystemService } from './reason-cancel-oop-system.service';

describe('ReasonCancelOopSystemService', () => {
  let service: ReasonCancelOopSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReasonCancelOopSystemService],
    }).compile();

    service = module.get<ReasonCancelOopSystemService>(ReasonCancelOopSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
