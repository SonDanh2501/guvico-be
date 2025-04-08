import { Test, TestingModule } from '@nestjs/testing';
import { SettingAppCollaboratorController } from './setting-app-collaborator.controller';

describe('SettingAppCollaboratorController', () => {
  let controller: SettingAppCollaboratorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SettingAppCollaboratorController],
    }).compile();

    controller = module.get<SettingAppCollaboratorController>(SettingAppCollaboratorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
