import { Test, TestingModule } from '@nestjs/testing';
import { PunishTicketManagerApiController } from './punish-ticket-manager-api.controller';

describe('PunishTicketManagerApiController', () => {
  let controller: PunishTicketManagerApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PunishTicketManagerApiController],
    }).compile();

    controller = module.get<PunishTicketManagerApiController>(PunishTicketManagerApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
