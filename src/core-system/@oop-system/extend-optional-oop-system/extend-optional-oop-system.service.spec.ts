import { Test, TestingModule } from '@nestjs/testing';
import { ExtendOptionalOopSystemService } from './extend-optional-oop-system.service';

describe('ExtendOptionalOopSystemService', () => {
  let service: ExtendOptionalOopSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExtendOptionalOopSystemService],
    }).compile();

    service = module.get<ExtendOptionalOopSystemService>(ExtendOptionalOopSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
