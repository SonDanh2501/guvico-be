import { Test, TestingModule } from '@nestjs/testing';
import { CollaboratorSchedulerService } from './collaborator-scheduler.service';

describe('CollaboratorSchedulerService', () => {
  let service: CollaboratorSchedulerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CollaboratorSchedulerService],
    }).compile();

    service = module.get<CollaboratorSchedulerService>(CollaboratorSchedulerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
