import { Test, TestingModule } from '@nestjs/testing';
import { LinkInviteRepositoryService } from './link-invite-repository.service';

describe('LinkInviteRepositoryService', () => {
  let service: LinkInviteRepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LinkInviteRepositoryService],
    }).compile();

    service = module.get<LinkInviteRepositoryService>(LinkInviteRepositoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
