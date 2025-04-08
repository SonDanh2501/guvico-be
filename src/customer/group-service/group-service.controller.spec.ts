import { Test, TestingModule } from '@nestjs/testing';
import { GroupServiceController } from './group-service.controller';

describe('GroupServiceController', () => {
  let controller: GroupServiceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupServiceController],
    }).compile();

    controller = module.get<GroupServiceController>(GroupServiceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
