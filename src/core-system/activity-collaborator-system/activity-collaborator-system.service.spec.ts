import { Test, TestingModule } from '@nestjs/testing';
import { ActivityCollaboratorSystemService } from './activity-collaborator-system.service';

describe('ActivityCollaboratorSystemService', () => {
  let service: ActivityCollaboratorSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActivityCollaboratorSystemService],
    }).compile();

    service = module.get<ActivityCollaboratorSystemService>(ActivityCollaboratorSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
