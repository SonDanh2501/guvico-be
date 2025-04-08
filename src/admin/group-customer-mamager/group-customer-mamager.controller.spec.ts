import { Test, TestingModule } from '@nestjs/testing';
import { GroupCustomerMamagerController } from './group-customer-mamager.controller';

describe('GroupCustomerMamagerController', () => {
  let controller: GroupCustomerMamagerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupCustomerMamagerController],
    }).compile();

    controller = module.get<GroupCustomerMamagerController>(GroupCustomerMamagerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
