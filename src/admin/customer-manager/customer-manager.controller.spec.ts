import { Test, TestingModule } from '@nestjs/testing';
import { CustomerManagerController } from './customer-manager.controller';

describe('CustomerManagerController', () => {
  let controller: CustomerManagerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerManagerController],
    }).compile();

    controller = module.get<CustomerManagerController>(CustomerManagerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
