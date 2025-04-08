import { Test, TestingModule } from '@nestjs/testing';
import { OptionalServiceManagerController } from './optional-service-manager.controller';

describe('OptionalServiceManagerController', () => {
  let controller: OptionalServiceManagerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OptionalServiceManagerController],
    }).compile();

    controller = module.get<OptionalServiceManagerController>(OptionalServiceManagerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
