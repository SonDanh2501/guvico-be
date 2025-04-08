import { Test, TestingModule } from '@nestjs/testing';
import { VietmapController } from './vietmap.controller';

describe('VietmapController', () => {
  let controller: VietmapController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VietmapController],
    }).compile();

    controller = module.get<VietmapController>(VietmapController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
