import { Test, TestingModule } from '@nestjs/testing';
import { InforCollaboratorApiController } from './infor-collaborator-api.controller';

describe('InforCollaboratorApiController', () => {
    let controller: InforCollaboratorApiController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [InforCollaboratorApiController],
        }).compile();

        controller = module.get<InforCollaboratorApiController>(InforCollaboratorApiController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
