import { Test, TestingModule } from '@nestjs/testing';
import { GroupOrderManagerApiController } from './group-order-manager-api.controller';

describe('GroupOrderManagerApiController', () => {
  let controller: GroupOrderManagerApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupOrderManagerApiController],
    }).compile();

    controller = module.get<GroupOrderManagerApiController>(GroupOrderManagerApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
