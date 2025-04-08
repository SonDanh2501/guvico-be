import { Test, TestingModule } from '@nestjs/testing';
import { DeviceTokenOopSystemService } from './device-token-oop-system.service';

describe('DeviceTokenOopSystemService', () => {
  let service: DeviceTokenOopSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeviceTokenOopSystemService],
    }).compile();

    service = module.get<DeviceTokenOopSystemService>(DeviceTokenOopSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
