import { Test, TestingModule } from '@nestjs/testing';
import { ZnsService } from './zns.service';

describe('ZnsService', () => {
  let service: ZnsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ZnsService],
    }).compile();

    service = module.get<ZnsService>(ZnsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
