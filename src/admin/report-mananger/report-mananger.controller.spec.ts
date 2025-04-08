import { Test, TestingModule } from '@nestjs/testing';
import { ReportManangerController } from './report-mananger.controller';

describe('ReportManangerController', () => {
  let controller: ReportManangerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportManangerController],
    }).compile();

    controller = module.get<ReportManangerController>(ReportManangerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
