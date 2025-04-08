import { Test, TestingModule } from '@nestjs/testing';
import { LeaderBoardOopSystemService } from './leader-board-oop-system.service';

describe('LeaderBoardOopSystemService', () => {
  let service: LeaderBoardOopSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LeaderBoardOopSystemService],
    }).compile();

    service = module.get<LeaderBoardOopSystemService>(LeaderBoardOopSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
