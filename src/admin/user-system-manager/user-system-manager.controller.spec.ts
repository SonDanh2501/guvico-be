import { Test, TestingModule } from '@nestjs/testing';
import { UserSystemManagerController } from './user-system-manager.controller';

describe('UserSystemManagerController', () => {
  let controller: UserSystemManagerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserSystemManagerController],
    }).compile();

    controller = module.get<UserSystemManagerController>(UserSystemManagerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
