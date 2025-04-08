import { Test, TestingModule } from '@nestjs/testing';
import { InfoTestCollaboratorService } from './info-test-collaborator.service';

describe('InfoTestCollaboratorService', () => {
  let service: InfoTestCollaboratorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InfoTestCollaboratorService],
    }).compile();

    service = module.get<InfoTestCollaboratorService>(InfoTestCollaboratorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
