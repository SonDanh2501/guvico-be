import { Test, TestingModule } from '@nestjs/testing';
import { CustomExceptionService } from './custom-exception.service';

describe('CustomExceptionService', () => {
  let service: CustomExceptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomExceptionService],
    }).compile();

    service = module.get<CustomExceptionService>(CustomExceptionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
