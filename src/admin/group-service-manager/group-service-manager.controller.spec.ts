import { Test, TestingModule } from '@nestjs/testing';
import { GroupServiceManagerController } from './group-service-manager.controller';

describe('GroupServiceManagerController', () => {
  let controller: GroupServiceManagerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupServiceManagerController],
    }).compile();

    controller = module.get<GroupServiceManagerController>(GroupServiceManagerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
