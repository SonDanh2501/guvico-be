import { Test, TestingModule } from '@nestjs/testing';
import { CoreSystemService } from './core-system.service';

describe('CoreSystemService', () => {
  let service: CoreSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CoreSystemService],
    }).compile();

    service = module.get<CoreSystemService>(CoreSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
