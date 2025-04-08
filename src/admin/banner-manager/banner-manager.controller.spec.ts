import { Test, TestingModule } from '@nestjs/testing';
import { BannerManagerController } from './banner-manager.controller';

describe('BannerManagerController', () => {
  let controller: BannerManagerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BannerManagerController],
    }).compile();

    controller = module.get<BannerManagerController>(BannerManagerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
