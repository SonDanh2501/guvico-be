import { Test, TestingModule } from '@nestjs/testing';
import { MidnightService } from './midnight.service';

describe('MidnightService', () => {
  let service: MidnightService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MidnightService],
    }).compile();

    service = module.get<MidnightService>(MidnightService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
