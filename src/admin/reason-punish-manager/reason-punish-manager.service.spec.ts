import { Test, TestingModule } from '@nestjs/testing';
import { ReasonPunishManagerService } from './reason-punish-manager.service';

describe('ReasonPunishManagerService', () => {
  let service: ReasonPunishManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReasonPunishManagerService],
    }).compile();

    service = module.get<ReasonPunishManagerService>(ReasonPunishManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
