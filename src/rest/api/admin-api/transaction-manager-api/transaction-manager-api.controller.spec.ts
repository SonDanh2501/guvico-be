import { Test, TestingModule } from '@nestjs/testing';
import { TransactionManagerApiController } from './transaction-manager-api.controller';

describe('TransactionManagerApiController', () => {
  let controller: TransactionManagerApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionManagerApiController],
    }).compile();

    controller = module.get<TransactionManagerApiController>(TransactionManagerApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
