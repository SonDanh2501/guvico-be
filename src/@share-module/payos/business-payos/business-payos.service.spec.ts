import { Test, TestingModule } from '@nestjs/testing';
import { BusinessPayosService } from './business-payos.service';

describe('BusinessPayosService', () => {
  let service: BusinessPayosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BusinessPayosService],
    }).compile();

    service = module.get<BusinessPayosService>(BusinessPayosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
