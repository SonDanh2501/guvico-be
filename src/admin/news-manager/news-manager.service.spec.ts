import { Test, TestingModule } from '@nestjs/testing';
import { NewsManagerService } from './news-manager.service';

describe('NewsManagerService', () => {
  let service: NewsManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NewsManagerService],
    }).compile();

    service = module.get<NewsManagerService>(NewsManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
