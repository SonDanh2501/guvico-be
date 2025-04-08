import { Test, TestingModule } from '@nestjs/testing';
import { AccumulationApiController } from './accumulation-api.controller';

describe('AccumulationApiController', () => {
  let controller: AccumulationApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccumulationApiController],
    }).compile();

    controller = module.get<AccumulationApiController>(AccumulationApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
