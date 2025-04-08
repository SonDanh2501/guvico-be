import { Test, TestingModule } from '@nestjs/testing';
import { BusinessPayosController } from './business-payos.controller';

describe('BusinessPayosController', () => {
  let controller: BusinessPayosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BusinessPayosController],
    }).compile();

    controller = module.get<BusinessPayosController>(BusinessPayosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
