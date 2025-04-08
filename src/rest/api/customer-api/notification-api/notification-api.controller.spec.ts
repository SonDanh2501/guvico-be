import { Test, TestingModule } from '@nestjs/testing';
import { NotificationApiController } from './notification-api.controller';

describe('NotificationApiController', () => {
  let controller: NotificationApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationApiController],
    }).compile();

    controller = module.get<NotificationApiController>(NotificationApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
