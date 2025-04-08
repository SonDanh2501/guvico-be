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

  @ApiTags('collaborator')
  @UseGuards(AuthGuard('jwt_collaborator'))
  @Get('get_info_collaborator')
  async statisticIncome(
    @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    @GetSubjectAction() subjectAction,
  ) {
    try {
      return await this.collaboratorSystemService.getInfoForAccumulationByCollaborator(lang, subjectAction._id);
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  }

  @ApiTags('collaborator')
  @UseGuards(AuthGuard('jwt_collaborator'))
  @Get('get_list_history_reward_point')
  async getListHistoryRewardPoint(
    @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    @GetSubjectAction() subjectAction,
    @IPageDecorator() iPage: iPageHistoryActivityAccumulationDTOCollaborator,
  ) {
    try {
      iPage.start = iPage.start || 0
      iPage.length = iPage.length || 10
      return await this.historyActivitySystemService.getListHistoryRewardPointByIdCollaborator(subjectAction._id, iPage);
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  }

  @ApiTags('collaborator')
  @UseGuards(AuthGuard('jwt_collaborator'))
  @Get('get_list_history_reward_money')
  async getListHistoryRewardMoney(
    @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    @GetSubjectAction() subjectAction,
    @IPageDecorator() iPage: iPageHistoryActivityAccumulationDTOCollaborator,
  ) {
    try {
      iPage.start = iPage.start || 0
      iPage.length = iPage.length || 10
      return await this.historyActivitySystemService.getListHistoryRewardMoneyByIdCollaborator(subjectAction._id, iPage);
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  }

  @ApiTags('collaborator')
  @UseGuards(AuthGuard('jwt_collaborator'))
  @Get('get_list_history_punish_ticket')
  async getListPunishTicketByIdCollaborator(
    @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    @GetSubjectAction() subjectAction,
    @IPageDecorator() iPage: iPageHistoryActivityAccumulationDTOCollaborator,
  ) {
    try {
      iPage.start = iPage.start || 0
      iPage.length = iPage.length || 10
      return await this.historyActivitySystemService.getListPunishTicketByIdCollaborator(subjectAction._id, iPage);
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  }

  @ApiTags('collaborator')
  @UseGuards(AuthGuard('jwt_collaborator'))
  @Get('get_list_reward_ticket')
  async getListRewardTicket(
    @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    @GetSubjectAction() subjectAction,
    @IPageDecorator() iPage: iPageHistoryActivityAccumulationDTOCollaborator,
  ) {
    try {
      iPage.start = iPage.start || 0
      iPage.length = iPage.length || 10
      return await this.rewardTicketSystemService.getListByCollaborator(subjectAction._id, iPage);
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  }

  @ApiTags('collaborator')
  @UseGuards(AuthGuard('jwt_collaborator'))
  @Get('get_list_punish_ticket')
  async getListPunishTicket(
    @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    @GetSubjectAction() subjectAction,
    @IPageDecorator() iPage: iPageHistoryActivityAccumulationDTOCollaborator,
  ) {
    try {
      return await this.punishTicketSystemService.getListByCollaborator(subjectAction._id, iPage);
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  }

  @ApiTags('collaborator')
  @UseGuards(AuthGuard('jwt_collaborator'))
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

  @ApiTags('collaborator')
  @UseGuards(AuthGuard('jwt_collaborator'))
  @Get('get_current_monthly_leader_board')
  async getCurrentMonthlyLeaderBoard(
    @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    @IPageDecorator() iPage: iPageDTO,
  ) {
    try {
      iPage.start = 0
      iPage.length = iPage?.length || 10
      return await this.leaderBoardSystemService.getCurrentMonthlyLeaderBoard(iPage);
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  }

  @ApiTags('collaborator')
  @UseGuards(AuthGuard('jwt_collaborator'))
  @Get('get_current_rank')
  async getCurrentRank(
    @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    @GetSubjectAction() subjectAction,
  ) {
    try {
      return await this.leaderBoardSystemService.getCurrentRank(lang, subjectAction._id);
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  }

  @ApiTags('collaborator')
  @UseGuards(AuthGuard('jwt_collaborator'))
  @Get('get_current_monthly_rank')
  async getCurrentMonthlyRank(
    @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    @GetSubjectAction() subjectAction,
  ) {
    try {
      return await this.leaderBoardSystemService.getCurrentMonthlyRank(lang, subjectAction._id);
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  }

  @ApiTags('collaborator')
  @UseGuards(AuthGuard('jwt_collaborator'))
  @Get('get_accumulation_by_time_frame')
  async getAccumulationByTimeFrame(
    @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    @Query() query,
    @GetSubjectAction() subjectAction,
  ) {
    try {
      query.start_date = query.start_date || new Date(new Date().setHours(0, 0, 0, 0)).toISOString()
      query.end_date = query.start_date || new Date(new Date().setHours(23, 59, 59, 59)).toISOString()
      return await this.accumulationSystemService.getAccumulateByCollaboratorAndTimeFrame(subjectAction._id, query.start_date, query.end_date);
    } catch (err) {
      throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  }
}
