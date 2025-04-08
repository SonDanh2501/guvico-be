import { Test, TestingModule } from '@nestjs/testing';
import { PunishPolicyRepositoryService } from './punish-policy-repository.service';

describe('PunishPolicyRepositoryService', () => {
  let service: PunishPolicyRepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PunishPolicyRepositoryService],
    }).compile();

    service = module.get<PunishPolicyRepositoryService>(PunishPolicyRepositoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
