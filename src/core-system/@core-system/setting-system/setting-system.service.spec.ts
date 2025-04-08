import { Test, TestingModule } from '@nestjs/testing';
import { SettingSystemService } from './setting-system.service';

describe('SettingSystemService', () => {
  let service: SettingSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SettingSystemService],
    }).compile();

    service = module.get<SettingSystemService>(SettingSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
