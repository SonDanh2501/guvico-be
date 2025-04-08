import { Module } from '@nestjs/common';
import { GeneralHandleService } from './general-handle.service';

@Module({
  providers: [GeneralHandleService],
  exports: [GeneralHandleService]
})
export class GeneralHandleModule {}
