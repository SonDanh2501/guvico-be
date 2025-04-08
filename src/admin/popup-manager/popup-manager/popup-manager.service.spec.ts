import { Test, TestingModule } from '@nestjs/testing';
import { PopupManagerService } from './popup-manager.service';

describe('PopupManagerService', () => {
  let service: PopupManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PopupManagerService],
    }).compile();

    service = module.get<PopupManagerService>(PopupManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
