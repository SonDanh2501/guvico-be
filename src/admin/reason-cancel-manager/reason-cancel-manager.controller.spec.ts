import { Test, TestingModule } from '@nestjs/testing';
import { ReasonCancelManagerController } from './reason-cancel-manager.controller';

describe('ReasonCancelManagerController', () => {
  let controller: ReasonCancelManagerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReasonCancelManagerController],
    }).compile();

    controller = module.get<ReasonCancelManagerController>(ReasonCancelManagerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
