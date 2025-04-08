import { Test, TestingModule } from '@nestjs/testing';
import { LeaderBoardSystemService } from './leader-board-system.service';

describe('LeaderBoardSystemService', () => {
  let service: LeaderBoardSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LeaderBoardSystemService],
    }).compile();

    service = module.get<LeaderBoardSystemService>(LeaderBoardSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
