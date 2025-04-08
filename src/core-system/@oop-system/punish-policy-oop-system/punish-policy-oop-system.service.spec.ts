import { Test, TestingModule } from '@nestjs/testing';
import { PunishPolicyOopSystemService } from './punish-policy-oop-system.service';

describe('PunishPolicyOopSystemService', () => {
  let service: PunishPolicyOopSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PunishPolicyOopSystemService],
    }).compile();

    service = module.get<PunishPolicyOopSystemService>(PunishPolicyOopSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
