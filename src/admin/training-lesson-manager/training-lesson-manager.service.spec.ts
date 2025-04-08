import { Test, TestingModule } from '@nestjs/testing';
import { TrainingLessonManagerService } from './training-lesson-manager.service';

describe('TrainingLessonManaegerService', () => {
  let service: TrainingLessonManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrainingLessonManagerService],
    }).compile();

    service = module.get<TrainingLessonManagerService>(TrainingLessonManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
