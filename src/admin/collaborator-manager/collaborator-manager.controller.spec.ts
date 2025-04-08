import { Test, TestingModule } from '@nestjs/testing';
import { CollaboratorManagerController } from './collaborator-manager.controller';

describe('CollaboratorManagerController', () => {
  let controller: CollaboratorManagerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CollaboratorManagerController],
    }).compile();

    controller = module.get<CollaboratorManagerController>(CollaboratorManagerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
