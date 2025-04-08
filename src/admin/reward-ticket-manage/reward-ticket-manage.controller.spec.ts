import { Test, TestingModule } from '@nestjs/testing';
import { RewardTicketManageController } from './reward-ticket-manage.controller';

describe('RewardTicketManageController', () => {
  let controller: RewardTicketManageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RewardTicketManageController],
    }).compile();

    controller = module.get<RewardTicketManageController>(RewardTicketManageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
