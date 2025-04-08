import { Test, TestingModule } from '@nestjs/testing';
import { SettingOopSystemService } from './setting-oop-system.service';

describe('SettingOopSystemService', () => {
  let service: SettingOopSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SettingOopSystemService],
    }).compile();

    service = module.get<SettingOopSystemService>(SettingOopSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
