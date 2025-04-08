import { Test, TestingModule } from '@nestjs/testing';
import { SystemSettingRepositoryService } from './system-setting-repository.service';

describe('SystemSettingRepositoryService', () => {
  let service: SystemSettingRepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SystemSettingRepositoryService],
    }).compile();

    service = module.get<SystemSettingRepositoryService>(SystemSettingRepositoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
