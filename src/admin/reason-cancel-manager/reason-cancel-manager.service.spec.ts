import { Test, TestingModule } from '@nestjs/testing';
import { ReasonCancelManagerService } from './reason-cancel-manager.service';

describe('ReasonCancelManagerService', () => {
  let service: ReasonCancelManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReasonCancelManagerService],
    }).compile();

    service = module.get<ReasonCancelManagerService>(ReasonCancelManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
