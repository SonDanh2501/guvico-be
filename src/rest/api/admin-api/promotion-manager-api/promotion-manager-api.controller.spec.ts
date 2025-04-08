import { Test, TestingModule } from '@nestjs/testing';
import { PromotionManagerApiController } from './promotion-manager-api.controller';

describe('PromotionManagerApiController', () => {
  let controller: PromotionManagerApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PromotionManagerApiController],
    }).compile();

    controller = module.get<PromotionManagerApiController>(PromotionManagerApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
