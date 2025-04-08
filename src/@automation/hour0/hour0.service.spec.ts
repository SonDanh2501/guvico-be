import { Test, TestingModule } from '@nestjs/testing';
import { Hour0Service } from './hour0.service';

describe('Hour0Service', () => {
  let service: Hour0Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Hour0Service],
    }).compile();

    service = module.get<Hour0Service>(Hour0Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
