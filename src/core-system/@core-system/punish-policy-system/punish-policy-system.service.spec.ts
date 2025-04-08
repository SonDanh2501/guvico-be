import { Test, TestingModule } from '@nestjs/testing';
import { PunishPolicySystemService } from './punish-policy-system.service';

describe('PunishPolicySystemService', () => {
  let service: PunishPolicySystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PunishPolicySystemService],
    }).compile();

    service = module.get<PunishPolicySystemService>(PunishPolicySystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
