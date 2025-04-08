import { Test, TestingModule } from '@nestjs/testing';
import { EtelecomService } from './etelecom.service';

describe('EtelecomService', () => {
  let service: EtelecomService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EtelecomService],
    }).compile();

    service = module.get<EtelecomService>(EtelecomService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
