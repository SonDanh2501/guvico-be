import { Test, TestingModule } from '@nestjs/testing';
import { GroupServiceManagerService } from './group-service-manager.service';

describe('GroupServiceManagerService', () => {
  let service: GroupServiceManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupServiceManagerService],
    }).compile();

    service = module.get<GroupServiceManagerService>(GroupServiceManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
