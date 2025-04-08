import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { BusinessPayosController } from './business-payos/business-payos.controller'
import { BusinessPayosService } from './business-payos/business-payos.service'
import { PersonalityPayosController } from './personality-payos/personality-payos.controller'
import { PersonalityPayosService } from './personality-payos/personality-payos.service'


@Module({
  imports:[ HttpModule ],
  controllers: [PersonalityPayosController, BusinessPayosController],
  providers:[PersonalityPayosService, BusinessPayosService],
  exports: [PersonalityPayosService, BusinessPayosService]
})
export class PayOSModule {}
