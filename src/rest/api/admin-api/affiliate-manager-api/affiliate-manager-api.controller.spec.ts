import { Test, TestingModule } from '@nestjs/testing';
import { AffiliateManagerApiController } from './affiliate-manager-api.controller';

describe('AffiliateManagerApiController', () => {
  let controller: AffiliateManagerApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AffiliateManagerApiController],
    }).compile();

    controller = module.get<AffiliateManagerApiController>(AffiliateManagerApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
