import { Test, TestingModule } from '@nestjs/testing';
import { PersonalityPayosService } from './personality-payos.service';

describe('PersonalityPayosService', () => {
  let service: PersonalityPayosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PersonalityPayosService],
    }).compile();

    service = module.get<PersonalityPayosService>(PersonalityPayosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
