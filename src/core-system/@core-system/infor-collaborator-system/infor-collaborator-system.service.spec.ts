import { Test, TestingModule } from '@nestjs/testing';
import { InforCollaboratorSystemService } from './infor-collaborator-system.service';

describe('InforCollaboratorSystemService', () => {
  let service: InforCollaboratorSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InforCollaboratorSystemService],
    }).compile();

    service = module.get<InforCollaboratorSystemService>(InforCollaboratorSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
