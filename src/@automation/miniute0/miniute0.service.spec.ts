import { Test, TestingModule } from '@nestjs/testing';
import { Miniute0Service } from './miniute0.service';

describe('Miniute0Service', () => {
  let service: Miniute0Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Miniute0Service],
    }).compile();

    service = module.get<Miniute0Service>(Miniute0Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
