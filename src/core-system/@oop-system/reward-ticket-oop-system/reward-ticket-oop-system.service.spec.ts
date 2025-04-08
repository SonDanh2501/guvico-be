import { Test, TestingModule } from '@nestjs/testing';
import { RewardTicketOopSystemService } from './reward-ticket-oop-system.service';

describe('RewardTicketOopSystemService', () => {
  let service: RewardTicketOopSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RewardTicketOopSystemService],
    }).compile();

    service = module.get<RewardTicketOopSystemService>(RewardTicketOopSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
