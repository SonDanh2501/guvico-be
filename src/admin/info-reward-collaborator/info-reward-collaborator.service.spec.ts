import { Test, TestingModule } from '@nestjs/testing';
import { InfoRewardCollaboratorService } from './info-reward-collaborator.service';

describe('InfoRewardCollaboratorService', () => {
  let service: InfoRewardCollaboratorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InfoRewardCollaboratorService],
    }).compile();

    service = module.get<InfoRewardCollaboratorService>(InfoRewardCollaboratorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
