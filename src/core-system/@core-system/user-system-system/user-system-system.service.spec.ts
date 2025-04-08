import { Test, TestingModule } from '@nestjs/testing';
import { UserSystemSystemService } from './user-system-system.service';

describe('UserSystemSystemService', () => {
  let service: UserSystemSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserSystemSystemService],
    }).compile();

    service = module.get<UserSystemSystemService>(UserSystemSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
