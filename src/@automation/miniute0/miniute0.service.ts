import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AutomationSystemService } from 'src/core-system/automation-system/automation-system.service';

@Injectable()
export class Miniute0Service {
    constructor(
        private automationSystemService: AutomationSystemService,
      ) { }
      private readonly logger = new Logger(Miniute0Service.name);

      
    @Cron('0 * * * * *')
    async handleCron() {
        const dateNow = new Date().toISOString();
        // console.log(dateNow, 'dateNow');
        
        this.automationSystemService.runAutomation('schedule');
    }
}
