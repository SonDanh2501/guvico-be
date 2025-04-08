import { Controller, Get, HttpException, HttpStatus, Query, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiTags } from '@nestjs/swagger'
import { DEFAULT_LANG, GetSubjectAction, IPageDecorator, iPageDTO, iPageHistoryActivityAccumulationDTOCollaborator, LANGUAGE, ValidateLangPipe } from 'src/@core'
import { AccumulationSystemService } from 'src/core-system/@core-system/accumulation-system/accumulation-system.service'
import { CollaboratorSystemService } from 'src/core-system/@core-system/collaborator-system/collaborator-system.service'
import { HistoryActivitySystemService } from 'src/core-system/@core-system/history-activity-system/history-activity-system.service'
import { LeaderBoardSystemService } from 'src/core-system/@core-system/leader-board-system/leader-board-system.service'
import { PunishTicketSystemService } from 'src/core-system/@core-system/punish-ticket-system/punish-ticket-system.service'
import { RewardTicketSystemService } from 'src/core-system/@core-system/reward-ticket-system/reward-ticket-system.service'

@Controller('accumulation')
export class AccumulationApiController {
  constructor(
    private accumulationSystemService: AccumulationSystemService,
    private collaboratorSystemService: CollaboratorSystemService,
    private historyActivitySystemService: HistoryActivitySystemService,
    private rewardTicketSystemService: RewardTicketSystemService,
    private punishTicketSystemService: PunishTicketSystemService,
    private leaderBoardSystemService: LeaderBoardSystemService,
  ) {}

  @ApiTags('admin')
  @UseGuards(AuthGuard('jwt_admin'))
  @Get('get_current_leader_board')
  async getCurrentLeaderBoard(
    @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    @IPageDecorator() iPage: iPageDTO,
  ) {
    try {
      iPage.start = 0
      iPage.length = iPage?.length || 10
      return await this.leaderBoardSystemService.getCurrentLeaderBoard(iPage);
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  }
}
