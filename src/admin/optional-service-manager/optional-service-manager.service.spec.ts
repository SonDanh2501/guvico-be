import { Test, TestingModule } from '@nestjs/testing';
import { OptionalServiceManagerService } from './optional-service-manager.service';

describe('OptionalServiceManagerService', () => {
  let service: OptionalServiceManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OptionalServiceManagerService],
    }).compile();

    service = module.get<OptionalServiceManagerService>(OptionalServiceManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
