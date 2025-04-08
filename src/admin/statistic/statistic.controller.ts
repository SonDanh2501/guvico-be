import { Body, Controller, Post, Query, Get, UseGuards, Param, HttpException, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { DEFAULT_LANG, iPageDTO, LANGUAGE, LoginAdminDto, iPageJobListsDTOAdmin, ValidateLangPipe, GetUserByToken, iPageStatisticDTO } from 'src/@core';
import { StatisticService } from './statistic.service';
import * as moment from 'moment';
import { subDays } from 'date-fns';

@Controller('statistic')
export class StatisticController {
     constructor(private statisticService: StatisticService) { }

     @ApiTags('admin')
     @UseGuards(AuthGuard('jwt_admin'))
     @Get('connection_service_percent')
     async connectionServicePercent(
          @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
     ) {
          const result = await this.statisticService.connectionServicePercent(lang);
          return result;
     }

     @ApiTags('admin')
     @UseGuards(AuthGuard('jwt_admin'))
     @Get('active_users')
     async getActiveUsers(
          @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
     ) {
          const result = await this.statisticService.getActiveUsers(lang);
          return result;
     }

     @ApiTags('admin')
     @UseGuards(AuthGuard('jwt_admin'))
     @Get('top_collaborators')
     async getTopCollaborators(
          @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
          @Query() iPage: iPageDTO,
          @Query("start_date") start_date: string,
          @Query("end_date") end_date: string,
     ) {
          iPage.length = Number(iPage.length) || 5;
          iPage.search = decodeURI(iPage.search || "");
          iPage.start = Number(iPage.start) || 0;
          const startDate = (start_date) ? start_date : moment().startOf('month').toISOString();
          const endDate = (end_date) ? end_date : moment().endOf('month').toISOString();
          const result = await this.statisticService.getTopCollaborators(lang, iPage, startDate, endDate);
          return result;
     }

     //      @ApiTags('admin')
     //     @UseGuards(AuthGuard('jwt_admin'))
     //     @Get('top_services')
     //      async getTopServices(
     //           @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
     //      ) {
     //           const result = await this.statisticService.getTopServices(lang);
     //           return result;
     //      }

     @ApiTags('admin')
     @UseGuards(AuthGuard('jwt_admin'))
     @Get('history_activity')
     async getHitoryActivity(
          @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
          @Query() iPage: iPageDTO,
     ) {
          iPage.length = Number(iPage.length) || 3;
          iPage.search = decodeURI(iPage.search || "");
          iPage.start = Number(iPage.start) || 0;
          const result = await this.statisticService.getHitoryActivity(lang, iPage);
          return result;
     }

     @ApiTags('admin')
     @UseGuards(AuthGuard('jwt_admin'))
     @Get('lastest_services')
     async getNewestServices(
          @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
          @Query() iPage: iPageDTO,
          @GetUserByToken() user
     ) {
          iPage.length = Number(iPage.length) || 5;
          iPage.search = decodeURI(iPage.search || "");
          iPage.start = Number(iPage.start) || 0;
          const result = await this.statisticService.getLastestServices(lang, iPage, user);
          return result;
     }

     @ApiTags('admin')
     @UseGuards(AuthGuard('jwt_admin'))
     @Get('job_lists')
     async getJobLists(
          @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
          @Query() iPage: iPageJobListsDTOAdmin,
          @GetUserByToken() user
     ) {
          try {
               iPage.length = Number(iPage.length) || 5;
               iPage.search = decodeURI(iPage.search || "");
               iPage.start = Number(iPage.start) || 0;
               iPage.start_date = (iPage.start_date) ? iPage.start_date : subDays(new Date(Date.now()), 7).toISOString();
               iPage.end_date = (iPage.end_date) ? iPage.end_date : new Date(Date.now()).toISOString();
               iPage.status = (iPage.status) ? iPage.status : "all";
               iPage.id_service = (iPage.id_service) ? iPage.id_service : "all";
               iPage.type_sort = (iPage.type_sort) ? iPage.type_sort : "date_create";
               iPage.payment_method = (iPage.payment_method) ? iPage.payment_method : "all";
               iPage.is_duplicate = (iPage.is_duplicate) ? iPage.is_duplicate : "false";
               // fix tam cho admin de push don pending
               // iPage.type_sort = "date_work"
               iPage.type_sort = (iPage.status === "pending") ? "date_work" : iPage.type_sort;

               const result = await this.statisticService.getJobLists(lang, iPage, user);
               return result;
          } catch (err) {
               throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
          }
     }

     @ApiTags('admin')
     @UseGuards(AuthGuard('jwt_admin'))
     @Get('get_weeks_of_month')
     async getWeekOfMonth(
          @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
          @Query() iPage: iPageJobListsDTOAdmin,
          @GetUserByToken() user
     ) {
          try {
               iPage.length = Number(iPage.length) || 5;
               iPage.search = decodeURI(iPage.search || "");
               iPage.start = Number(iPage.start) || 0;
               // iPage.start_date = (!iPage.start_date) ? new Date(Date.now()).toISOString() : iPage.start_date;
               // iPage.end_date = (!iPage.end_date) ? new Date(Date.now()).toISOString() : iPage.end_date;
               iPage.status = (!iPage.status) ? "all" : iPage.status;
               const result = await this.statisticService.getWeekOfMonth(lang, iPage);
               return result;
          } catch (err) {
               throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
          }

     }

     @ApiTags('admin')
     @UseGuards(AuthGuard('jwt_admin'))
     @Get('get_total_money_for_time')
     async getTotalMoneyForTime(
          @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
          @Query() iPage: iPageJobListsDTOAdmin,
          @GetUserByToken() user
     ) {
          try {
               const result = await this.statisticService.getTotalMoneyForTime(lang);
               return result;
          } catch (err) {
               throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
          }
     }


     @ApiTags('admin')
     @UseGuards(AuthGuard('jwt_admin'))
     @Get('get_list_balance')
     async getListBalance(
          @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
          @Query() iPage: iPageStatisticDTO,
          @GetUserByToken() user
     ) {
          try {
               iPage.start = (iPage.start) ? iPage.start : 0;
               iPage.length = (iPage.length) ? iPage.length : 10;
               const result = await this.statisticService.getListBalance(lang, iPage);
               return result;
          } catch (err) {
               throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
          }////
     }//////

     @ApiTags('admin')
     @UseGuards(AuthGuard('jwt_admin'))
     @Get('get_balance')
     async getBalance(
          @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
          @Query() iPage: iPageStatisticDTO,
          @GetUserByToken() user
     ) {
          try {
               iPage.start = (iPage.start) ? iPage.start : 0;
               iPage.length = (iPage.length) ? iPage.length : 10;
               const result = await this.statisticService.getBalance(lang, iPage);
               return result;
          } catch (err) {
               throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
          }////
     }//////

     @ApiTags('admin')
     @UseGuards(AuthGuard('jwt_admin'))
     @Get('test_balance/:idCollaborator')
     async testBalance(
          @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
          @Query() iPage: iPageJobListsDTOAdmin,
          @GetUserByToken() user,
          @Param('idCollaborator') idCollaborator: string
     ) {
          try {
               const result = await this.statisticService.getHistoryBalanceOpening(lang, idCollaborator, iPage);
               return result;
          } catch (err) {
               throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
          }

     }

}
