import { Test, TestingModule } from '@nestjs/testing';
import { PunishTicketOopSystemService } from './punish-ticket-oop-system.service';

describe('PunishTicketOopSystemService', () => {
  let service: PunishTicketOopSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PunishTicketOopSystemService],
    }).compile();

    service = module.get<PunishTicketOopSystemService>(PunishTicketOopSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
