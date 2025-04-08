import { Test, TestingModule } from '@nestjs/testing';
import { PromotionManagerService } from './promotion-manager.service';

describe('PromotionManagerService', () => {
  let service: PromotionManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PromotionManagerService],
    }).compile();

    service = module.get<PromotionManagerService>(PromotionManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
