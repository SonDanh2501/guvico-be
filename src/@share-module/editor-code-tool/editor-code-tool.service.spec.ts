import { Test, TestingModule } from '@nestjs/testing';
import { EditorCodeToolService } from './editor-code-tool.service';

describe('EditorCodeToolService', () => {
  let service: EditorCodeToolService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EditorCodeToolService],
    }).compile();

    service = module.get<EditorCodeToolService>(EditorCodeToolService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
