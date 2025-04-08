import { Test, TestingModule } from '@nestjs/testing';
import { GeneralHandleService } from './general-handle.service';

describe('GeneralHandleService', () => {
  let service: GeneralHandleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GeneralHandleService],
    }).compile();

    service = module.get<GeneralHandleService>(GeneralHandleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
