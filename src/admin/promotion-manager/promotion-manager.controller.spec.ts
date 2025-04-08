import { Test, TestingModule } from '@nestjs/testing';
import { PromotionManagerController } from './promotion-manager.controller';

describe('PromotionManagerController', () => {
  let controller: PromotionManagerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PromotionManagerController],
    }).compile();

    controller = module.get<PromotionManagerController>(PromotionManagerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
