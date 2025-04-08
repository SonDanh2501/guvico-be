import { Test, TestingModule } from '@nestjs/testing';
import { InfoRewardCollaboratorController } from './info-reward-collaborator.controller';

describe('InfoRewardCollaboratorController', () => {
  let controller: InfoRewardCollaboratorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InfoRewardCollaboratorController],
    }).compile();

    controller = module.get<InfoRewardCollaboratorController>(InfoRewardCollaboratorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
