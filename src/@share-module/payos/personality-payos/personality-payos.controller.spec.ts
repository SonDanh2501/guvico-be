import { Test, TestingModule } from '@nestjs/testing';
import { PersonalityPayosController } from './personality-payos.controller';

describe('PersonalityPayosController', () => {
  let controller: PersonalityPayosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PersonalityPayosController],
    }).compile();

    controller = module.get<PersonalityPayosController>(PersonalityPayosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
