import { Test, TestingModule } from '@nestjs/testing';
import { PromotionRepositoryService } from './promotion-repository.service';

describe('PromotionRepositoryService', () => {
  let service: PromotionRepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PromotionRepositoryService],
    }).compile();

    service = module.get<PromotionRepositoryService>(PromotionRepositoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
