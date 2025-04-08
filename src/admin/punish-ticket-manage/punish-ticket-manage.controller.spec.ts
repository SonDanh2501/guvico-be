import { Test, TestingModule } from '@nestjs/testing';
import { PunishTicketManageController } from './punish-ticket-manage.controller';

describe('PunishTicketManageController', () => {
  let controller: PunishTicketManageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PunishTicketManageController],
    }).compile();

    controller = module.get<PunishTicketManageController>(PunishTicketManageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
