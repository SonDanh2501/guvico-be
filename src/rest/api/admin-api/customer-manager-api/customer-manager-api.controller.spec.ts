import { Test, TestingModule } from '@nestjs/testing';
import { CustomerManagerApiController } from './customer-manager-api.controller';

describe('CustomerManagerApiController', () => {
  let controller: CustomerManagerApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerManagerApiController],
    }).compile();

    controller = module.get<CustomerManagerApiController>(CustomerManagerApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
