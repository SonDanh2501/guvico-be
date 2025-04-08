import { Test, TestingModule } from '@nestjs/testing';
import { GroupOrderManagerController } from './group-order-manager.controller';

describe('GroupOrderManagerController', () => {
  let controller: GroupOrderManagerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupOrderManagerController],
    }).compile();

    controller = module.get<GroupOrderManagerController>(GroupOrderManagerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
