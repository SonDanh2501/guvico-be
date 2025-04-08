import { Test, TestingModule } from '@nestjs/testing';
import { CollaboratorBonusController } from './collaborator-bonus.controller';

describe('CollaboratorBonusController', () => {
  let controller: CollaboratorBonusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CollaboratorBonusController],
    }).compile();

    controller = module.get<CollaboratorBonusController>(CollaboratorBonusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
