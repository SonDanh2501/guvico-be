import { Test, TestingModule } from '@nestjs/testing';
import { GroupCustomerScheduleService } from './group-customer-schedule.service';

describe('GroupCustomerScheduleService', () => {
  let service: GroupCustomerScheduleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupCustomerScheduleService],
    }).compile();

    service = module.get<GroupCustomerScheduleService>(GroupCustomerScheduleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
