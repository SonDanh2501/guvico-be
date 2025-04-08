import { Test, TestingModule } from '@nestjs/testing';
import { ExtendOptionalManagerController } from './extend-optional-manager.controller';

describe('ExtendOptionalManagerController', () => {
  let controller: ExtendOptionalManagerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExtendOptionalManagerController],
    }).compile();

    controller = module.get<ExtendOptionalManagerController>(ExtendOptionalManagerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
