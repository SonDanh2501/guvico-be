import { Test, TestingModule } from '@nestjs/testing';
import { GroupPromotionRepositoryService } from './group-promotion-repository.service';

describe('GroupPromotionRepositoryService', () => {
  let service: GroupPromotionRepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupPromotionRepositoryService],
    }).compile();

    service = module.get<GroupPromotionRepositoryService>(GroupPromotionRepositoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
