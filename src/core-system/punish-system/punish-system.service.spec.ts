import { Test, TestingModule } from '@nestjs/testing';
import { PunishSystemService } from './punish-system.service';

describe('PunishSystemService', () => {
  let service: PunishSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PunishSystemService],
    }).compile();

    service = module.get<PunishSystemService>(PunishSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
