import { Test, TestingModule } from '@nestjs/testing';
import { ContentHistoryActivityManagerApiController } from './content-history-activity-manager-api.controller';

describe('ContentHistoryActivityManagerApiController', () => {
  let controller: ContentHistoryActivityManagerApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContentHistoryActivityManagerApiController],
    }).compile();

    controller = module.get<ContentHistoryActivityManagerApiController>(ContentHistoryActivityManagerApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
