import { Test, TestingModule } from '@nestjs/testing';
import { CustomerRequestManagerController } from './customer-request-manager.controller';

describe('CustomerRequestManagerController', () => {
  let controller: CustomerRequestManagerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerRequestManagerController],
    }).compile();

    controller = module.get<CustomerRequestManagerController>(CustomerRequestManagerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
