import { Test, TestingModule } from '@nestjs/testing';
import { InfoTestCollaboratorController } from './info-test-collaborator.controller';

describe('InfoTestCollaboratorController', () => {
  let controller: InfoTestCollaboratorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InfoTestCollaboratorController],
    }).compile();

    controller = module.get<InfoTestCollaboratorController>(InfoTestCollaboratorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
