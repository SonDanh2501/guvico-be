import { Test, TestingModule } from '@nestjs/testing';
import { PhoneOTPSystemService } from './phone-otp-system.service';

describe('PhoneOtpSystemService', () => {
  let service: PhoneOTPSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PhoneOTPSystemService],
    }).compile();

    service = module.get<PhoneOTPSystemService>(PhoneOTPSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
