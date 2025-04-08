import { Test, TestingModule } from '@nestjs/testing';
import { PopupManagerController } from './popup-manager.controller';

describe('PopupManagerController', () => {
  let controller: PopupManagerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PopupManagerController],
    }).compile();

    controller = module.get<PopupManagerController>(PopupManagerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
