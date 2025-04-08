import { Test, TestingModule } from '@nestjs/testing';
import { PopupRepositoryService } from './popup-repository.service';

describe('PopupRepositoryService', () => {
  let service: PopupRepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PopupRepositoryService],
    }).compile();

    service = module.get<PopupRepositoryService>(PopupRepositoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
