import { Test, TestingModule } from '@nestjs/testing';
import { SettingAppCollaboratorService } from './setting-app-collaborator.service';

describe('SettingAppCollaboratorService', () => {
  let service: SettingAppCollaboratorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SettingAppCollaboratorService],
    }).compile();

    service = module.get<SettingAppCollaboratorService>(SettingAppCollaboratorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
