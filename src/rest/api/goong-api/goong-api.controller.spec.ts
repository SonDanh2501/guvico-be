import { Test, TestingModule } from '@nestjs/testing';
import { GoongApiController } from './goong-api.controller';

describe('GoongApiController', () => {
  let controller: GoongApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoongApiController],
    }).compile();

    controller = module.get<GoongApiController>(GoongApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
