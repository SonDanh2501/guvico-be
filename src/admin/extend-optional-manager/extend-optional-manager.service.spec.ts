import { Test, TestingModule } from '@nestjs/testing';
import { ExtendOptionalManagerService } from './extend-optional-manager.service';

describe('ExtendOptionalManagerService', () => {
  let service: ExtendOptionalManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExtendOptionalManagerService],
    }).compile();

    service = module.get<ExtendOptionalManagerService>(ExtendOptionalManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
