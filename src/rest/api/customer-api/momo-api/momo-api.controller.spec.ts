import { Test, TestingModule } from '@nestjs/testing';
import { MomoApiController } from './momo-api.controller';

describe('MomoApiController', () => {
  let controller: MomoApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MomoApiController],
    }).compile();

    controller = module.get<MomoApiController>(MomoApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});