import { Test, TestingModule } from '@nestjs/testing';
import { BehaviorTrackingRepositoryService } from './behavior-tracking-repository.service';

describe('BehaviorTrackingRepositoryService', () => {
  let service: BehaviorTrackingRepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BehaviorTrackingRepositoryService],
    }).compile();

    service = module.get<BehaviorTrackingRepositoryService>(BehaviorTrackingRepositoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
