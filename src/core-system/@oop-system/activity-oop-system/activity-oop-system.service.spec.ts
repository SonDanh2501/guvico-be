import { Test, TestingModule } from '@nestjs/testing';
import { ActivityOopSystemService } from './activity-oop-system.service';

describe('ActivityOopSystemService', () => {
    let service: ActivityOopSystemService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ActivityOopSystemService],
        }).compile();

        service = module.get<ActivityOopSystemService>(ActivityOopSystemService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});