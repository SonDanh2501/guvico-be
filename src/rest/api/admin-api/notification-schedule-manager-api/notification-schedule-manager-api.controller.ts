import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiTags } from '@nestjs/swagger'
import { createNotificationScheduleDTOAdmin, DEFAULT_LANG, GetSubjectAction, iPageNotificationScheduleDTO, LANGUAGE, updateNotificationScheduleDTOAdmin, ValidateLangPipe } from 'src/@core'
import { NotificationScheduleSystemService } from 'src/core-system/@core-system/notification-schedule-system/notification-schedule-system.service'

@Controller('notification_schedule_manager')
export class NotificationScheduleManagerApiController {
  constructor(
    private notificationScheduleSystemService: NotificationScheduleSystemService,
  ) {
    
  }

  @ApiTags('admin')
  @UseGuards(AuthGuard('jwt_admin'))
  @Post('/create_item')
  async createNotificationSchdule(
      @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
      @Body() payload: createNotificationScheduleDTOAdmin,
      @GetSubjectAction() subjectAction
  ) {
      try {
        return await this.notificationScheduleSystemService.createNotificationSchdule(lang, payload, subjectAction)
      } catch (err) {
          throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
      }
  }

  @ApiTags('admin')
  @UseGuards(AuthGuard('jwt_admin'))
  @Get('get_list')
    async getListItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageNotificationScheduleDTO,
        @Query('status') status: string,
    ) {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.start = Number(iPage.start) || 0;
            // iPage.is_created = (!!+iPage?.is_created) || false; 
            // iPage.is_created = String(iPage.is_created) === "true"; 
            const reqStatus = status || "todo";
            const result = await this.notificationScheduleSystemService.getListItem(lang, iPage, reqStatus);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
      }

  @ApiTags('admin')
  @UseGuards(AuthGuard('jwt_admin'))
  @Post('/update_is_delete/:idNotificationSchedule')
  async updateIsDelete(
      @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
      @Param('idNotificationSchedule') idNotificationSchedule:string,
      @GetSubjectAction() subjectAction
  ) {
      try {
        return await this.notificationScheduleSystemService.updateIsDelete(lang, idNotificationSchedule, subjectAction)
      } catch (err) {
          throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
      }
  }

  @ApiTags('admin')
  @UseGuards(AuthGuard('jwt_admin'))
  @Post('/update_notification_schedule/:idNotificationSchedule')
  async updateNotificationSchedule(
      @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
      @Param('idNotificationSchedule') idNotificationSchedule:string,
      @GetSubjectAction() subjectAction,
      @Body() body: updateNotificationScheduleDTOAdmin
  ) {
      try {
        return await this.notificationScheduleSystemService.updateNotificationSchedule(lang, subjectAction, idNotificationSchedule, body)
      } catch (err) {
          throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
      }
  }
}
