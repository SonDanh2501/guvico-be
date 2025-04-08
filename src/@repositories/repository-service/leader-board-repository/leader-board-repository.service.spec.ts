import { Test, TestingModule } from '@nestjs/testing';
import { LeaderBoardRepositoryService } from './leader-board-repository.service';

describe('LeaderBoardRepositoryService', () => {
  let service: LeaderBoardRepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LeaderBoardRepositoryService],
    }).compile();

    service = module.get<LeaderBoardRepositoryService>(LeaderBoardRepositoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
