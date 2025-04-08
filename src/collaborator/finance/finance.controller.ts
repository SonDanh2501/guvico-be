import { Controller, Get, Param, Post, Query, UseGuards, Body, HttpException, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { DEFAULT_LANG, GetUserByToken, iPageDTO, topupCollaboratorDTOCollaborator, iPageHistoryTransferDTOCollaborator, withdrawCollaboratorDTOCollaborator, TranferMoneyCollaboratorDTOCollaborator, iPageHistoryOrderDTOCollaborator, LANGUAGE, ValidateLangPipe, iPageHistoryRemainderDTOCollaborator, iPageCollaboratorDTO } from 'src/@core';
import { FinanceService } from './finance.service';
import { subDays } from 'date-fns';
import { userInfo } from 'os';

@Controller('finance')
export class FinanceController {
    constructor(
        private financeService: FinanceService,
    ) { }

    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Get('/get_remainder')
    async getRemainder(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.financeService.getRemainder(lang, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Get('/history_finance_job_day')
    async historyFinanceJob(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Query() iPage: iPageHistoryOrderDTOCollaborator,
    ) {
        try {
            iPage.length = Number(iPage.length) || 100;
            iPage.search = iPage.search || '';
            iPage.start = Number(iPage.start) || 0;
            iPage.start_date = (!iPage.start_date) ? new Date(Date.now()).toISOString() : iPage.start_date;
            iPage.end_date = (!iPage.end_date) ? new Date(Date.now()).toISOString() : iPage.end_date;
            const result = await this.financeService.historyFinanceJob(lang, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Get('/history_finance_job_week')
    async historyFinanceJobWeek(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Query() iPage: iPageHistoryOrderDTOCollaborator,
    ) {
        try {
            iPage.length = Number(iPage.length) || 100;
            iPage.search = iPage.search || '';
            iPage.start = Number(iPage.start) || 0;
            iPage.start_date = (!iPage.start_date) ? new Date(Date.now()).toISOString() : iPage.start_date;
            iPage.end_date = (!iPage.end_date) ? new Date(Date.now()).toISOString() : iPage.end_date;
            const result = await this.financeService.historyFinanceJobWeek(lang, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Get('/history_finance_job_month')
    async historyFinanceJobMonth(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Query() iPage: iPageHistoryOrderDTOCollaborator,
    ) {
        try {
            iPage.length = Number(iPage.length) || 100;
            iPage.search = iPage.search || '';
            iPage.start = Number(iPage.start) || 0;
            iPage.start_date = (!iPage.start_date) ? new Date(Date.now()).toISOString() : iPage.start_date;
            iPage.end_date = (!iPage.end_date) ? new Date(Date.now()).toISOString() : iPage.end_date;
            const result = await this.financeService.historyFinanceJobMonth(lang, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }



    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Get('/get_gross_income')
    async getGrossIncome(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
    ) {
        try {
            const result = await this.financeService.getGrossIncome(lang, user._id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Get('/get_history_remainder')
    async getHistoryRemainder(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageHistoryRemainderDTOCollaborator,
        @GetUserByToken() user,
    ) {
        try {
            iPage.start_date = (!iPage.start_date) ? subDays(new Date(Date.now()), 30).toISOString() : iPage.start_date;
            iPage.end_date = (!iPage.end_date) ? new Date(Date.now()).toISOString() : iPage.end_date;
            iPage.start = (iPage.start) ? iPage.start : 0;
            iPage.length = (iPage.length) ? iPage.length : 10;
            const result = await this.financeService.getHistoryRemainder(lang, iPage, user._id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Get('get_detail_remainder_item/:id')
    async getDetailRemainderItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
    ) {
        try {
            const result = await this.financeService.getDetailRemainderItem(lang, id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Post('/top_up')
    async topupAccount(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: topupCollaboratorDTOCollaborator,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.financeService.topupAccount(lang, user, req);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Post('/withdraw')
    async withdrawAccount(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: withdrawCollaboratorDTOCollaborator,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.financeService.withdrawAccount(lang, user, req);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    // @ApiTags('collaborator')
    // @UseGuards(AuthGuard('jwt_collaborator'))
    // @Get('/get_history_transfer')
    // async getHistoryTransfer(
    //     @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    //     @Query() iPage: iPageDTO,
    //     @GetUserByToken() user,
    // ) {
    //     try {
    //         const result = await this.financeService.getHistoryTransfer(lang, iPage, user._id);
    //         return result;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }

    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Get('/get_history_transfer')
    async getHistoryTransfer(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Query() iPage: iPageHistoryTransferDTOCollaborator,
    ) {
        try {
            iPage.length = Number(iPage.length) || 20;
            iPage.search = iPage.search || '';
            iPage.start = Number(iPage.start) || 0;
            iPage.start_date = (!iPage.start_date) ? new Date(Date.now()).toISOString() : iPage.start_date;
            iPage.end_date = (!iPage.end_date) ? new Date(Date.now()).toISOString() : iPage.end_date;
            const result = await this.financeService.getHistoryTransfer(lang, iPage, user._id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Get('get_detail_item/:id')
    async getDetailItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param("id") id: string
    ) {
        try {
            const result = await this.financeService.getDetailItem(lang, id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Get('transfered_money/:id')
    async transferedMoney(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param("id") id: string,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.financeService.transferedMoney(lang, user, id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Get('cancel_transfer/:id')
    async cancelTransaction(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param("id") id: string,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.financeService.cancelTransaction(lang, user, id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Post('change_money_wallet')
    async changeMoneyWallet(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: any,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.financeService.changeMoneyWallet(lang, req, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Get('statistic_month')
    async statisticMonth(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Query() iPage: iPageCollaboratorDTO,
    ) {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.start = Number(iPage.start) || 0;
            iPage.start_date = (!iPage.start_date) ? new Date(Date.now()).toISOString() : iPage.start_date;
            iPage.end_date = (!iPage.end_date) ? new Date(Date.now()).toISOString() : iPage.end_date;
            const result = await this.financeService.statisticMonth(lang, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Get('statistic_current_month')
    async statisticCurrentMonth(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
    ) {
        try {
            const result = await this.financeService.statisticCurrentMonth(lang, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Get('over_six_month_ago')
    async overSixMonthAgo(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
    ) {
        try {
            const result = await this.financeService.overSixMonthAgo(lang, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
