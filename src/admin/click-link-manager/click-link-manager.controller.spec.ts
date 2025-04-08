import { Test, TestingModule } from '@nestjs/testing';
import { ClickLinkManagerController } from './click-link-manager.controller';

describe('ClickLinkManagerController', () => {
  let controller: ClickLinkManagerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClickLinkManagerController],
    }).compile();

    controller = module.get<ClickLinkManagerController>(ClickLinkManagerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
