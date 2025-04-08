import { Test, TestingModule } from '@nestjs/testing';
import { PhoneOTPOopSystemService } from './phone-otp-oop-system.service';

describe('PhoneOtpOopSystemService', () => {
  let service: PhoneOTPOopSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PhoneOTPOopSystemService],
    }).compile();

    service = module.get<PhoneOTPOopSystemService>(PhoneOTPOopSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
