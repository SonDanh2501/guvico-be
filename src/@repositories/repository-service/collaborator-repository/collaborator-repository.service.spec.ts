import { Test, TestingModule } from '@nestjs/testing';
import { CollaboratorRepositoryService } from './collaborator-repository.service';

describe('CollaboratorRepositoryService', () => {
  let service: CollaboratorRepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CollaboratorRepositoryService],
    }).compile();

    service = module.get<CollaboratorRepositoryService>(CollaboratorRepositoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
