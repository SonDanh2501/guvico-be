import { Test, TestingModule } from '@nestjs/testing';
import { PunishTicketManageService } from './punish-ticket-manage.service';

describe('PunishTicketManageService', () => {
  let service: PunishTicketManageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PunishTicketManageService],
    }).compile();

    service = module.get<PunishTicketManageService>(PunishTicketManageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
