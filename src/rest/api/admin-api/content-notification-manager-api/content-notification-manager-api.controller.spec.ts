import { Test, TestingModule } from '@nestjs/testing';
import { ContentNotificationManagerApiController } from './content-notification-manager-api.controller';

describe('ContentNotificationManagerApiController', () => {
  let controller: ContentNotificationManagerApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContentNotificationManagerApiController],
    }).compile();

    controller = module.get<ContentNotificationManagerApiController>(ContentNotificationManagerApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
