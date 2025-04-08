import { Test, TestingModule } from '@nestjs/testing';
import { PunishTicketSystemService } from './punish-ticket-system.service';

describe('PunishTicketSystemService', () => {
  let service: PunishTicketSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PunishTicketSystemService],
    }).compile();

    service = module.get<PunishTicketSystemService>(PunishTicketSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
