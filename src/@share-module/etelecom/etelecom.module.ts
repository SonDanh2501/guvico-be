import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { EtelecomService } from './etelecom.service'

@Module({
  imports: [HttpModule],
  providers: [EtelecomService],
  exports:[EtelecomService]
})
export class EtelecomModule {}
