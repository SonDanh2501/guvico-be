import { Test, TestingModule } from '@nestjs/testing';
import { PromotionApiController } from './promotion-api.controller';

describe('PromotionApiController', () => {
  let controller: PromotionApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PromotionApiController],
    }).compile();

    controller = module.get<PromotionApiController>(PromotionApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
