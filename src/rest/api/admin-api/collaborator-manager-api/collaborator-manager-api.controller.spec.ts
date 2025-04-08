import { Test, TestingModule } from '@nestjs/testing';
import { CollaboratorManagerApiController } from './collaborator-manager-api.controller';

describe('CollaboratorManagerApiController', () => {
  let controller: CollaboratorManagerApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CollaboratorManagerApiController],
    }).compile();

    controller = module.get<CollaboratorManagerApiController>(CollaboratorManagerApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
