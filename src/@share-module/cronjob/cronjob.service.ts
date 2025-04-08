import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { AutomationSystemService } from 'src/core-system/@core-system/automation-system/automation-system.service'

@Injectable()
export class CronjobService {
    constructor (
        private automationSystemService: AutomationSystemService
    ) {}

        @Cron(CronExpression.EVERY_10_SECONDS)
        async runCron() {
            // this.automationSystemService.runAutomationForSchedule('every_minute')
        }
}
