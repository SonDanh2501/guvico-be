import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { AutomationSystemService } from 'src/core-system/@core-system/automation-system/automation-system.service'
import { CollaboratorSystemService } from 'src/core-system/@core-system/collaborator-system/collaborator-system.service'
import { LeaderBoardSystemService } from 'src/core-system/@core-system/leader-board-system/leader-board-system.service'
import { RandomReferralCodeSystemService } from 'src/core-system/@core-system/random-referral-code-system/random-referral-code-system.service'
import { ReportSystemService } from 'src/core-system/@core-system/report-system/report-system.service'

@Injectable()
export class MidnightService {
  constructor (
    private automationSystemService: AutomationSystemService,
    private reportSystemService: ReportSystemService,
    private leaderBoardSystemService: LeaderBoardSystemService,
    private collaboratorSystemService: CollaboratorSystemService,
    private randomReferralCodeSystemService: RandomReferralCodeSystemService,
  ) {}
  
  @Cron('0 0 * * 3')
  async runCron() {
      this.automationSystemService.runAutomationForSchedule('every_midnight_wednesday')
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    timeZone: 'Asia/Ho_Chi_Minh'
  })
  async handleCronAtMidnight() {
      await this.leaderBoardSystemService.summarizeLeaderboard("vi")
      this.collaboratorSystemService.resetRewardPoint()
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT, {
    timeZone: 'Asia/Ho_Chi_Minh'
  })
  async handleCronAt1STDayOfMonth() {
      await this.leaderBoardSystemService.summarizeMonthlyLeaderboard("vi")
      this.collaboratorSystemService.resetMonthlyRewardPoint()
  }

  
  @Cron('0 0 2 * * *', {
    timeZone: 'Asia/Ho_Chi_Minh'
  })
  async handleCronAt2AM() {
      this.reportSystemService.createReportAtMidnight()
  }
}
