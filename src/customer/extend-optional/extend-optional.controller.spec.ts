import { Test, TestingModule } from '@nestjs/testing';
import { ExtendOptionalController } from './extend-optional.controller';

describe('ExtendOptionalController', () => {
  let controller: ExtendOptionalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExtendOptionalController],
    }).compile();

    controller = module.get<ExtendOptionalController>(ExtendOptionalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
