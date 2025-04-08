import { Test, TestingModule } from '@nestjs/testing';
import { GroupPromotionManagerController } from './group-promotion-manager.controller';

describe('GroupPromotionManagerController', () => {
  let controller: GroupPromotionManagerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupPromotionManagerController],
    }).compile();

    controller = module.get<GroupPromotionManagerController>(GroupPromotionManagerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
