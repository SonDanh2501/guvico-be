import { Test, TestingModule } from '@nestjs/testing';
import { ExamTestRepositoryService } from './exam-test-repository.service';

describe('ExamTestRepositoryService', () => {
  let service: ExamTestRepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExamTestRepositoryService],
    }).compile();

    service = module.get<ExamTestRepositoryService>(ExamTestRepositoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
