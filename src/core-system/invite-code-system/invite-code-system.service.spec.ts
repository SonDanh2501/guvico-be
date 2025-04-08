import { Test, TestingModule } from '@nestjs/testing';
import { InviteCodeSystemService } from './invite-code-system.service';

describe('InviteCodeSystemService', () => {
  let service: InviteCodeSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InviteCodeSystemService],
    }).compile();

    service = module.get<InviteCodeSystemService>(InviteCodeSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
