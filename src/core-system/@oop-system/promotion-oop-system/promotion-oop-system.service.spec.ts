import { Test, TestingModule } from '@nestjs/testing';
import { PromotionOopSystemService } from './promotion-oop-system.service';

describe('PromotionOopSystemService', () => {
  let service: PromotionOopSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PromotionOopSystemService],
    }).compile();

    service = module.get<PromotionOopSystemService>(PromotionOopSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
