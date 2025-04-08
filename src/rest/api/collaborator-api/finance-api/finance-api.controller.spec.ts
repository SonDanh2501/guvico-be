import { Test, TestingModule } from '@nestjs/testing';
import { FinanceApiController } from './finance-api.controller';

describe('FinanceApiController', () => {
  let controller: FinanceApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FinanceApiController],
    }).compile();

    controller = module.get<FinanceApiController>(FinanceApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
