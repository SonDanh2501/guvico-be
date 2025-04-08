import { Test, TestingModule } from '@nestjs/testing';
import { ServiceManagerController } from './service-manager.controller';

describe('ServiceManagerController', () => {
  let controller: ServiceManagerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServiceManagerController],
    }).compile();

    controller = module.get<ServiceManagerController>(ServiceManagerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
