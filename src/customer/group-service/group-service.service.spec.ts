import { Test, TestingModule } from '@nestjs/testing';
import { GroupServiceService } from './group-service.service';

describe('GroupServiceService', () => {
  let service: GroupServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupServiceService],
    }).compile();

    service = module.get<GroupServiceService>(GroupServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
