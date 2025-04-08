import { Test, TestingModule } from '@nestjs/testing';
import { TraininglessonsOopSystemService } from './traininglessons-oop-system.service';

describe('TraininglessonsOopSystemService', () => {
  let service: TraininglessonsOopSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TraininglessonsOopSystemService],
    }).compile();

    service = module.get<TraininglessonsOopSystemService>(TraininglessonsOopSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
