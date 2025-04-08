import { Controller, Get, HttpException, HttpStatus, Query, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiTags } from '@nestjs/swagger'
import { DEFAULT_LANG, GetSubjectAction, LANGUAGE, ValidateLangPipe } from 'src/@core'
import { FinanceSystemService } from 'src/core-system/@core-system/finance-system/finance-system.service'

@Controller('finance')
export class FinanceApiController {
    constructor (
        private financeSystemService: FinanceSystemService
    ) {}


    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Get('statistic_income')
    async statisticIncome(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetSubjectAction() subjectAction,
        @Query("start_date") startDate: string,
        @Query("end_date") endDate: string,
        @Query("group") group: string,
    ) {
        try {
            startDate = (!startDate) ? new Date(Date.now()).toISOString() : startDate;
            endDate = (!endDate) ? new Date(Date.now()).toISOString() : endDate;
            group = (group) ? group : "days";
            const result = await this.financeSystemService.statisticIncome(lang, subjectAction, group, startDate, endDate);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Get('statistic_income_by_service')
    async statisticIncomeByService(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetSubjectAction() subjectAction,
        @Query("start_date") startDate: string,
        @Query("end_date") endDate: string,
        @Query("group") group: string,
    ) {
        try {
            startDate = (!startDate) ? new Date(Date.now()).toISOString() : startDate;
            endDate = (!endDate) ? new Date(Date.now()).toISOString() : endDate;
            group = (group) ? group : "days";
            const result = await this.financeSystemService.statisticIncomeByService(lang, subjectAction, group, startDate, endDate);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }



    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Get('total_statistic_income')
    async totalStatisticIncome(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetSubjectAction() subjectAction,
    ) {
        try {
            const result = await this.financeSystemService.totalStatisticIncome(lang, subjectAction);
            console.log('check');
            
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Get('get_total_reward_money')
    async getTotalRewardMoney(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetSubjectAction() subjectAction,
        @Query("start_date") startDate: string,
        @Query("end_date") endDate: string,
        @Query("group") group: string,
    ) {
        try {
            startDate = (!startDate) ? new Date(Date.now()).toISOString() : startDate;
            endDate = (!endDate) ? new Date(Date.now()).toISOString() : endDate;
            group = (group) ? group : "days";
            const result = await this.financeSystemService.getTotalRewardMoneyByTimeFrame(subjectAction, group, startDate, endDate);
            
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
