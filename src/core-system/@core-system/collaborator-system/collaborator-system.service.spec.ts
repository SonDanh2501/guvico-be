import { Test, TestingModule } from '@nestjs/testing';
import { CollaboratorSystemService } from './collaborator-system.service';

describe('CollaboratorSystemService', () => {
  let service: CollaboratorSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CollaboratorSystemService],
    }).compile();

    service = module.get<CollaboratorSystemService>(CollaboratorSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
