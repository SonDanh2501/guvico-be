import { Test, TestingModule } from '@nestjs/testing';
import { BannerManagerService } from './banner-manager.service';

describe('BannerManagerService', () => {
  let service: BannerManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BannerManagerService],
    }).compile();

    service = module.get<BannerManagerService>(BannerManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
