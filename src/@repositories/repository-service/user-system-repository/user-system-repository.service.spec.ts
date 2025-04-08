import { Test, TestingModule } from '@nestjs/testing';
import { UserSystemRepositoryService } from './user-system-repository.service';

describe('UserSystemRepositoryService', () => {
  let service: UserSystemRepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserSystemRepositoryService],
    }).compile();

    service = module.get<UserSystemRepositoryService>(UserSystemRepositoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
