import { Test, TestingModule } from '@nestjs/testing';
import { TrainingLessonManagerApiController } from './training-lesson-manager-api.controller';

describe('TrainingLessonManagerApiController', () => {
  let controller: TrainingLessonManagerApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrainingLessonManagerApiController],
    }).compile();

    controller = module.get<TrainingLessonManagerApiController>(TrainingLessonManagerApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
