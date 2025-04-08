import { Test, TestingModule } from '@nestjs/testing';
import { OrderManagerApiController } from './order-manager-api.controller';

describe('OrderManagerApiController', () => {
  let controller: OrderManagerApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderManagerApiController],
    }).compile();

    controller = module.get<OrderManagerApiController>(OrderManagerApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
