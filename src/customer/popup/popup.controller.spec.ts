import { Test, TestingModule } from '@nestjs/testing';
import { PopupController } from './popup.controller';

describe('PopupController', () => {
  let controller: PopupController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PopupController],
    }).compile();

    controller = module.get<PopupController>(PopupController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
