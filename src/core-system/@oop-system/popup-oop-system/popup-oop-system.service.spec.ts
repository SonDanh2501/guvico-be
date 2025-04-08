import { Test, TestingModule } from '@nestjs/testing';
import { PopupOopSystemService } from './popup-oop-system.service';

describe('PopupOopSystemService', () => {
  let service: PopupOopSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PopupOopSystemService],
    }).compile();

    service = module.get<PopupOopSystemService>(PopupOopSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
