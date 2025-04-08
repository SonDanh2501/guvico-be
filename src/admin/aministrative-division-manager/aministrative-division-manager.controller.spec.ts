import { Test, TestingModule } from '@nestjs/testing';
import { AministrativeDivisionManagerController } from './aministrative-division-manager.controller';

describe('AministrativeDivisionManagerController', () => {
  let controller: AministrativeDivisionManagerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AministrativeDivisionManagerController],
    }).compile();

    controller = module.get<AministrativeDivisionManagerController>(AministrativeDivisionManagerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
