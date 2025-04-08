import { Test, TestingModule } from '@nestjs/testing';
import { PolicyManageController } from './policy-manage.controller';

describe('PolicyManageController', () => {
  let controller: PolicyManageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PolicyManageController],
    }).compile();

    controller = module.get<PolicyManageController>(PolicyManageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
