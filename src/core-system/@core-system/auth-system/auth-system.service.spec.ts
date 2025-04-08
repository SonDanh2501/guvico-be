import { Test, TestingModule } from '@nestjs/testing';
import { AuthSystemService } from './auth-system.service';

describe('AuthSystemService', () => {
  let service: AuthSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthSystemService],
    }).compile();

    service = module.get<AuthSystemService>(AuthSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
