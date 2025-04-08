import { Test, TestingModule } from '@nestjs/testing';
import { LinkInviteService } from './link-invite.service';

describe('LinkInviteService', () => {
  let service: LinkInviteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LinkInviteService],
    }).compile();

    service = module.get<LinkInviteService>(LinkInviteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
