import { Test, TestingModule } from '@nestjs/testing';
import { BusinessManagerService } from './business-manager.service';

describe('BusinessManagerService', () => {
  let service: BusinessManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BusinessManagerService],
    }).compile();

    service = module.get<BusinessManagerService>(BusinessManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
