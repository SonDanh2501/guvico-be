import { Test, TestingModule } from '@nestjs/testing';
import { DeviceTokenRepositoryService } from './device-token-repository.service';

describe('DeviceTokenRepositoryService', () => {
  let service: DeviceTokenRepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeviceTokenRepositoryService],
    }).compile();

    service = module.get<DeviceTokenRepositoryService>(DeviceTokenRepositoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
