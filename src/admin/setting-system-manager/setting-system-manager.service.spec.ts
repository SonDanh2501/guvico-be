import { Test, TestingModule } from '@nestjs/testing';
import { SettingSystemManagerService } from './setting-system-manager.service';

describe('SettingSystemManagerService', () => {
  let service: SettingSystemManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SettingSystemManagerService],
    }).compile();

    service = module.get<SettingSystemManagerService>(SettingSystemManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
