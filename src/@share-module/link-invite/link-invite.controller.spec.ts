import { Test, TestingModule } from '@nestjs/testing';
import { LinkInviteController } from './link-invite.controller';

describe('LinkInviteController', () => {
  let controller: LinkInviteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LinkInviteController],
    }).compile();

    controller = module.get<LinkInviteController>(LinkInviteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
