import { Test, TestingModule } from '@nestjs/testing';
import { GoongController } from './goong.controller';

describe('GoongController', () => {
  let controller: GoongController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoongController],
    }).compile();

    controller = module.get<GoongController>(GoongController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
