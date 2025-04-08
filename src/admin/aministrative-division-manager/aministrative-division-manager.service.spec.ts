import { Test, TestingModule } from '@nestjs/testing';
import { AministrativeDivisionManagerService } from './aministrative-division-manager.service';

describe('AministrativeDivisionManagerService', () => {
  let service: AministrativeDivisionManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AministrativeDivisionManagerService],
    }).compile();

    service = module.get<AministrativeDivisionManagerService>(AministrativeDivisionManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
