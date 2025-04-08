import { Test, TestingModule } from '@nestjs/testing';
import { PhoneOTPRepositoryService } from './phone-otp-repository.service';

describe('PhoneOtpRepositoryService', () => {
  let service: PhoneOTPRepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PhoneOTPRepositoryService],
    }).compile();

    service = module.get<PhoneOTPRepositoryService>(PhoneOTPRepositoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
