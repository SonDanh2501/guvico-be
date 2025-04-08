import { Test, TestingModule } from '@nestjs/testing';
import { CollaboratorBonusService } from './collaborator-bonus.service';

describe('CollaboratorBonusService', () => {
  let service: CollaboratorBonusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CollaboratorBonusService],
    }).compile();

    service = module.get<CollaboratorBonusService>(CollaboratorBonusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
