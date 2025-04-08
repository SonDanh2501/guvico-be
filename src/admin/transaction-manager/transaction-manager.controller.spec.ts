import { Test, TestingModule } from '@nestjs/testing';
import { TransactionManagerController } from './transaction-manager.controller';

describe('TransactionManagerController', () => {
  let controller: TransactionManagerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionManagerController],
    }).compile();

    controller = module.get<TransactionManagerController>(TransactionManagerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
