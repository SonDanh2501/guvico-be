import { Test, TestingModule } from '@nestjs/testing';
import { TrainingLessonApiController } from './training-lesson-api.controller';

describe('ExamTestsApiController', () => {
    let controller: TrainingLessonApiController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [TrainingLessonApiController],
        }).compile();

        controller = module.get<TrainingLessonApiController>(TrainingLessonApiController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
