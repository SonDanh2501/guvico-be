import { Test, TestingModule } from '@nestjs/testing';
import { BusinessManagerController } from './business-manager.controller';

describe('BusinessManagerController', () => {
  let controller: BusinessManagerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BusinessManagerController],
    }).compile();

    controller = module.get<BusinessManagerController>(BusinessManagerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
