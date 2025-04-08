import { Test, TestingModule } from '@nestjs/testing';
import { TraininglessonsSystemService } from './traininglessons-system.service';

describe('TraininglessonsSystemService', () => {
  let service: TraininglessonsSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TraininglessonsSystemService],
    }).compile();

    service = module.get<TraininglessonsSystemService>(TraininglessonsSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
