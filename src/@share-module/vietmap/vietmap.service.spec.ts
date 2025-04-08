import { Test, TestingModule } from '@nestjs/testing';
import { VietmapService } from './vietmap.service';

describe('VietmapService', () => {
  let service: VietmapService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VietmapService],
    }).compile();

    service = module.get<VietmapService>(VietmapService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
