import { Test, TestingModule } from '@nestjs/testing';
import { PhoneBlacklistOopSystemService } from './phone-blacklist-oop-system.service';

describe('PhoneBlacklistOopSystemService', () => {
  let service: PhoneBlacklistOopSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PhoneBlacklistOopSystemService],
    }).compile();

    service = module.get<PhoneBlacklistOopSystemService>(PhoneBlacklistOopSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
