import { Test, TestingModule } from '@nestjs/testing';
import { PolicyManageService } from './policy-manage.service';

describe('PolicyManageService', () => {
  let service: PolicyManageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PolicyManageService],
    }).compile();

    service = module.get<PolicyManageService>(PolicyManageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
