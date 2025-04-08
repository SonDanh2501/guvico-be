import { Test, TestingModule } from '@nestjs/testing';
import { GroupOrderApiController } from './group-order-api.controller';

describe('GroupOrderApiController', () => {
  let controller: GroupOrderApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupOrderApiController],
    }).compile();

    controller = module.get<GroupOrderApiController>(GroupOrderApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
