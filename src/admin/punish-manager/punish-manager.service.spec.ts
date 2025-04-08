import { Test, TestingModule } from '@nestjs/testing';
import { PunishManagerService } from './punish-manager.service';

describe('PunishManagerService', () => {
  let service: PunishManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PunishManagerService],
    }).compile();

    service = module.get<PunishManagerService>(PunishManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
