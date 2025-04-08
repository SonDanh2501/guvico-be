import { Test, TestingModule } from '@nestjs/testing';
import { TrainingLessonRepositoryService } from './training-lesson-repository.service';

describe('TrainingLessonRepositoryService', () => {
  let service: TrainingLessonRepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrainingLessonRepositoryService],
    }).compile();

    service = module.get<TrainingLessonRepositoryService>(TrainingLessonRepositoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
