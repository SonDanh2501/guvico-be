import { Test, TestingModule } from '@nestjs/testing';
import { CollaboratorSettingRepositoryService } from './collaborator-setting-repository.service';

describe('CollaboratorSettingRepositoryService', () => {
  let service: CollaboratorSettingRepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CollaboratorSettingRepositoryService],
    }).compile();

    service = module.get<CollaboratorSettingRepositoryService>(CollaboratorSettingRepositoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
