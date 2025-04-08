import { Test, TestingModule } from '@nestjs/testing';
import { PunishPeriodicScheduleService } from './punish-periodic-schedule.service';

describe('PunishPeriodicScheduleService', () => {
  let service: PunishPeriodicScheduleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PunishPeriodicScheduleService],
    }).compile();

    service = module.get<PunishPeriodicScheduleService>(PunishPeriodicScheduleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
