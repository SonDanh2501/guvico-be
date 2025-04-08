import { Test, TestingModule } from '@nestjs/testing';
import { PushNotiSystemService } from './push-noti-system.service';

describe('PushNotiSystemService', () => {
  let service: PushNotiSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PushNotiSystemService],
    }).compile();

    service = module.get<PushNotiSystemService>(PushNotiSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
