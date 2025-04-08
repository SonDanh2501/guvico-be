import { Test, TestingModule } from '@nestjs/testing';
import { TrainingLessonManaegerController } from './training-lesson-manager.controller';

describe('TrainingLessonManaegerController', () => {
  let controller: TrainingLessonManaegerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrainingLessonManaegerController],
    }).compile();

    controller = module.get<TrainingLessonManaegerController>(TrainingLessonManaegerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
