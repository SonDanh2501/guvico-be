import { Test, TestingModule } from '@nestjs/testing';
import { PopupManagerApiController } from './popup-manager-api.controller';

describe('PopupManagerApiController', () => {
  let controller: PopupManagerApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PopupManagerApiController],
    }).compile();

    controller = module.get<PopupManagerApiController>(PopupManagerApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
