import { Test, TestingModule } from '@nestjs/testing';
import { UserSystemManagerService } from './user-system-manager.service';

describe('UserSystemManagerService', () => {
  let service: UserSystemManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserSystemManagerService],
    }).compile();

    service = module.get<UserSystemManagerService>(UserSystemManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
