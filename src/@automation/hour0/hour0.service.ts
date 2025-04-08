import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AutomationSystemService } from 'src/core-system/automation-system/automation-system.service';

@Injectable()
export class Hour0Service {
    constructor(
        private automationSystemService: AutomationSystemService,
      ) { }

      
    @Cron('0 0 * * * *')
    async handleCron() {
        
        // this.automationSystemService.runAutomation('schedule');
    }
}
