import { Test, TestingModule } from '@nestjs/testing';
import { InfoTestCollaboratorRepositoryService } from './info-test-collaborator-repository.service';

describe('InfoTestCollaboratorRepositoryService', () => {
  let service: InfoTestCollaboratorRepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InfoTestCollaboratorRepositoryService],
    }).compile();

    service = module.get<InfoTestCollaboratorRepositoryService>(InfoTestCollaboratorRepositoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
