import { Test, TestingModule } from '@nestjs/testing';
import { UserSystemOoopSystemService } from './user-system-ooop-system.service';

describe('UserSystemOoopSystemService', () => {
  let service: UserSystemOoopSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserSystemOoopSystemService],
    }).compile();

    service = module.get<UserSystemOoopSystemService>(UserSystemOoopSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
