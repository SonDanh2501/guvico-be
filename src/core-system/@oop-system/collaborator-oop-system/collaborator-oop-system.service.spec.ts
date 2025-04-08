import { Test, TestingModule } from '@nestjs/testing';
import { CollaboratorOopSystemService } from './collaborator-oop-system.service';

describe('CollaboratorOopSystemService', () => {
  let service: CollaboratorOopSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CollaboratorOopSystemService],
    }).compile();

    service = module.get<CollaboratorOopSystemService>(CollaboratorOopSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
