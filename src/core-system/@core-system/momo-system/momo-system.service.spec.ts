import { Test, TestingModule } from '@nestjs/testing';
import { MomoSystemService } from './momo-system.service';

describe('MomoSystemService', () => {
    let service: MomoSystemService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [MomoSystemService],
        }).compile();

        service = module.get<MomoSystemService>(MomoSystemService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});