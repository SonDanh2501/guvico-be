import { Test, TestingModule } from '@nestjs/testing';
import { OptionalServiceController } from './optional-service.controller';

describe('OptionalServiceController', () => {
  let controller: OptionalServiceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OptionalServiceController],
    }).compile();

    controller = module.get<OptionalServiceController>(OptionalServiceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
