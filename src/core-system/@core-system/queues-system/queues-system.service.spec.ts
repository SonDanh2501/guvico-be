import { Test, TestingModule } from '@nestjs/testing';
import { QueuesSystemService } from './queues-system.service';

describe('QueuesSystemService', () => {
  let service: QueuesSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QueuesSystemService],
    }).compile();

    service = module.get<QueuesSystemService>(QueuesSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
