import { Test, TestingModule } from '@nestjs/testing';
import { RewardCollaboratorManagerController } from './reward-collaborator-manager.controller';

describe('RewardCollaboratorManagerController', () => {
  let controller: RewardCollaboratorManagerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RewardCollaboratorManagerController],
    }).compile();

    controller = module.get<RewardCollaboratorManagerController>(RewardCollaboratorManagerController);
  });
 
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
