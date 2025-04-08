import { Test, TestingModule } from '@nestjs/testing';
import { OrderApiController } from './order-api.controller';

describe('OrderApiController', () => {
  let controller: OrderApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderApiController],
    }).compile();

    controller = module.get<OrderApiController>(OrderApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
