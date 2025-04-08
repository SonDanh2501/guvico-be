import { Test, TestingModule } from '@nestjs/testing';
import { RewardTicketRepositoryService } from './reward-ticket-repository.service';

describe('RewardTicketRepositoryService', () => {
  let service: RewardTicketRepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RewardTicketRepositoryService],
    }).compile();

    service = module.get<RewardTicketRepositoryService>(RewardTicketRepositoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
