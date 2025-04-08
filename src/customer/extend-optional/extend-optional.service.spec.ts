import { Test, TestingModule } from '@nestjs/testing';
import { ExtendOptionalService } from './extend-optional.service';

describe('ExtendOptionalService', () => {
  let service: ExtendOptionalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExtendOptionalService],
    }).compile();

    service = module.get<ExtendOptionalService>(ExtendOptionalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
