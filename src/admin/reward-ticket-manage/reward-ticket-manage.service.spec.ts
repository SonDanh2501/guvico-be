import { Test, TestingModule } from '@nestjs/testing';
import { RewardTicketManageService } from './reward-ticket-manage.service';

describe('RewardTicketManageService', () => {
  let service: RewardTicketManageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RewardTicketManageService],
    }).compile();

    service = module.get<RewardTicketManageService>(RewardTicketManageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
