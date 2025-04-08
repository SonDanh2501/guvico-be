import { Test, TestingModule } from '@nestjs/testing';
import { InviteSystemService } from './invite-system.service';

describe('InviteSystemService', () => {
  let service: InviteSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InviteSystemService],
    }).compile();

    service = module.get<InviteSystemService>(InviteSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
