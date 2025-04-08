import { Test, TestingModule } from '@nestjs/testing';
import { LinkInviteApiController } from './link-invite-api.controller';

describe('LinkInviteApiController', () => {
  let controller: LinkInviteApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LinkInviteApiController],
    }).compile();

    controller = module.get<LinkInviteApiController>(LinkInviteApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
