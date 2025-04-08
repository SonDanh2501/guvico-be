import { Test, TestingModule } from '@nestjs/testing';
import { CollaboratorManagerService } from './collaborator-manager.service';

describe('CollaboratorManagerService', () => {
  let service: CollaboratorManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CollaboratorManagerService],
    }).compile();

    service = module.get<CollaboratorManagerService>(CollaboratorManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
