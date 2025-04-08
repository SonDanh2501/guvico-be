import { Test, TestingModule } from '@nestjs/testing';
import { PromotionSystemService } from './promotion-system.service';

describe('PromotionSystemService', () => {
  let service: PromotionSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PromotionSystemService],
    }).compile();

    service = module.get<PromotionSystemService>(PromotionSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
