import { Test, TestingModule } from '@nestjs/testing';
import { ExtendOptionalSystemService } from './extend-optional-system.service';

describe('ExtendOptionalSystemService', () => {
  let service: ExtendOptionalSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExtendOptionalSystemService],
    }).compile();

    service = module.get<ExtendOptionalSystemService>(ExtendOptionalSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
