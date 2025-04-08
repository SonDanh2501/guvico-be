import { Test, TestingModule } from '@nestjs/testing';
import { MigrateService } from './migrate.service';

describe('MigrateService', () => {
  let service: MigrateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MigrateService],
    }).compile();

    service = module.get<MigrateService>(MigrateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
