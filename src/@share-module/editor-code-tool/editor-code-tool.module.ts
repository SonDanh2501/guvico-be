import { Module } from '@nestjs/common';
import { EditorCodeToolService } from './editor-code-tool.service';
import { CustomExceptionModule } from '../custom-exception/custom-exception.module';
import { GeneralHandleModule } from '../general-handle/general-handle.module';

@Module({
  imports: [
    CustomExceptionModule,
    GeneralHandleModule
  ],
  providers: [EditorCodeToolService],
  exports: [EditorCodeToolService]
})
export class EditorCodeToolModule {}
