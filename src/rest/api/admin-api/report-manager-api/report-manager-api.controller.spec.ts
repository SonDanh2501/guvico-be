import { Test, TestingModule } from '@nestjs/testing'
import { ReportManagerApiController } from './report-manager-api.controller'

describe('TrainingLessonManagerApiController', () => {
  let controller: ReportManagerApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportManagerApiController],
    }).compile();

    controller = module.get<ReportManagerApiController>(ReportManagerApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
