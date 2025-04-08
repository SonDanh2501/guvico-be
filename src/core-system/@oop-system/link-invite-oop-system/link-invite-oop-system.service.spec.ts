import { Test, TestingModule } from '@nestjs/testing';
import { LinkInviteOopSystemService } from './link-invite-oop-system.service';

describe('LinkInviteOopSystemService', () => {
  let service: LinkInviteOopSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LinkInviteOopSystemService],
    }).compile();

    service = module.get<LinkInviteOopSystemService>(LinkInviteOopSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
