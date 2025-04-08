import { Test, TestingModule } from '@nestjs/testing';
import { DeviceTokenSystemService } from './device-token-system.service';

describe('DeviceTokenSystemService', () => {
  let service: DeviceTokenSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeviceTokenSystemService],
    }).compile();

    service = module.get<DeviceTokenSystemService>(DeviceTokenSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
