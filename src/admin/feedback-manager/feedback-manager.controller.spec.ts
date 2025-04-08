import { Test, TestingModule } from '@nestjs/testing';
import { FeedbackManagerController } from './feedback-manager.controller';

describe('FeedbackManagerController', () => {
  let controller: FeedbackManagerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeedbackManagerController],
    }).compile();

    controller = module.get<FeedbackManagerController>(FeedbackManagerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
