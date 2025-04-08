import { Test, TestingModule } from '@nestjs/testing';
import { Miniute30Service } from './miniute30.service';

describe('Miniute30Service', () => {
  let service: Miniute30Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Miniute30Service],
    }).compile();

    service = module.get<Miniute30Service>(Miniute30Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
