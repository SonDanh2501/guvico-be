import { Test, TestingModule } from '@nestjs/testing';
import { RewardCollaboratorManagerService } from './reward-collaborator-manager.service';

describe('RewardCollaboratorManagerService', () => {
  let service: RewardCollaboratorManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RewardCollaboratorManagerService],
    }).compile();

    service = module.get<RewardCollaboratorManagerService>(RewardCollaboratorManagerService);
  });
  
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
