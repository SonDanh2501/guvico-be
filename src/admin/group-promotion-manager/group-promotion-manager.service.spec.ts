import { Test, TestingModule } from '@nestjs/testing';
import { GroupPromotionManagerService } from './group-promotion-manager.service';

describe('GroupPromotionManagerService', () => {
  let service: GroupPromotionManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupPromotionManagerService],
    }).compile();

    service = module.get<GroupPromotionManagerService>(GroupPromotionManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
