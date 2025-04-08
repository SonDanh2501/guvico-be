import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { ZnsService } from './zns.service'

@Module({
  imports: [HttpModule],
  providers: [ZnsService],
  exports: [ZnsService]
})
export class ZnsModule {}
