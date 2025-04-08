import { Test, TestingModule } from '@nestjs/testing';
import { AffiliateApiController } from './affiliate-api.controller';

describe('AffiliateApiController', () => {
  let controller: AffiliateApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AffiliateApiController],
    }).compile();

    controller = module.get<AffiliateApiController>(AffiliateApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
