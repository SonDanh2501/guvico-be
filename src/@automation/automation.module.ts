import { Module } from '@nestjs/common';
import { CoreSystemModule } from 'src/core-system/core-system.module';
import { ScheduleModule } from '@nestjs/schedule';
import { Miniute0Service } from './miniute0/miniute0.service';
import { Miniute15Service } from './miniute15/miniute15.service';
import { Miniute30Service } from './miniute30/miniute30.service';
import { AutomationService } from './automation/automation.service';
import { Hour0Service } from './hour0/hour0.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    CoreSystemModule
  ],
  providers: [Miniute0Service, Miniute15Service, Miniute30Service, AutomationService, Hour0Service]
})
export class AutomationModule {}
