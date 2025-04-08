import { Test, TestingModule } from '@nestjs/testing';
import { RewardTicketSystemService } from './reward-ticket-system.service';

describe('RewardTicketSystemService', () => {
  let service: RewardTicketSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RewardTicketSystemService],
    }).compile();

    service = module.get<RewardTicketSystemService>(RewardTicketSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
