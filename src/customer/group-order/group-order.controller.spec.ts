import { Test, TestingModule } from '@nestjs/testing';
import { GroupOrderController } from './group-order.controller';

describe('GroupOrderController', () => {
  let controller: GroupOrderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupOrderController],
    }).compile();

    controller = module.get<GroupOrderController>(GroupOrderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
