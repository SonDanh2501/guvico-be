import { Test, TestingModule } from '@nestjs/testing';
import { PopupSystemService } from './popup-system.service';

describe('PopupSystemService', () => {
  let service: PopupSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PopupSystemService],
    }).compile();

    service = module.get<PopupSystemService>(PopupSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
