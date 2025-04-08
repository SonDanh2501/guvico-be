import { Test, TestingModule } from '@nestjs/testing';
import { PunishTicketRepositoryService } from './punish-ticket-repository.service';

describe('PunishTicketRepositoryService', () => {
  let service: PunishTicketRepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PunishTicketRepositoryService],
    }).compile();

    service = module.get<PunishTicketRepositoryService>(PunishTicketRepositoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
