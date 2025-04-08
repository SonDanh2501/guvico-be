import { Test, TestingModule } from '@nestjs/testing';
import { Miniute15Service } from './miniute15.service';

describe('Miniute15Service', () => {
  let service: Miniute15Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Miniute15Service],
    }).compile();

    service = module.get<Miniute15Service>(Miniute15Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
