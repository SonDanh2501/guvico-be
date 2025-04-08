import { Test, TestingModule } from '@nestjs/testing';
import { ClickLinkManagerService } from './click-link-manager.service';

describe('ClickLinkManagerService', () => {
  let service: ClickLinkManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClickLinkManagerService],
    }).compile();

    service = module.get<ClickLinkManagerService>(ClickLinkManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
