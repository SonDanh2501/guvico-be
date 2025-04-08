import { Test, TestingModule } from '@nestjs/testing';
import { GoongService } from './goong.service';

describe('GoongService', () => {
  let service: GoongService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GoongService],
    }).compile();

    service = module.get<GoongService>(GoongService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
