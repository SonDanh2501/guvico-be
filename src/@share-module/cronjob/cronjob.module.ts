import { Module } from '@nestjs/common';
import { CronjobService } from './cronjob.service';
import { ScheduleModule } from '@nestjs/schedule';
import { CoreSystemModule2 } from 'src/core-system/@core-system/core-system.module';
import { GeneralHandleModule } from '../general-handle/general-handle.module';
import { MinuteService } from './minute/minute.service';
import { HourService } from './hour/hour.service';
import { MidnightService } from './midnight/midnight.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    CoreSystemModule2,
    GeneralHandleModule
  ],
  providers: [CronjobService, MinuteService, HourService, MidnightService]
})
export class CronjobModule2 {}
