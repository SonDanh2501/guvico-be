import { Controller, Get, Param, Post, Query, UseGuards, Body, HttpException, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { DEFAULT_LANG, GetUserByToken, iPageDTO, TranferMoneyCustomerDTOCustomer, withdrawCollaboratorDTOCollaborator, TranferMoneyCollaboratorDTOCollaborator, iPageHistoryOrderDTOCollaborator, LANGUAGE, ValidateLangPipe, iPageHistoryTransferDTOCustomer } from 'src/@core';
import { FinanceService } from './finance.service';

@Controller('finance')
export class FinanceController {
    constructor(
        private financeService: FinanceService,
    ) { }


    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Post('/top_up')
    async topupAccount(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: TranferMoneyCustomerDTOCustomer,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.financeService.topupAccount(lang, user, req);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Get('get_detail_transition/:id')
    async getDetailItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Param("id") id: string,
    ) {
        try {
            const result = await this.financeService.getDetailTransition(lang, user, id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Get('transfered_money/:id')
    async transferedMoney(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param("id") id: string,
    ) {
        try {
            const result = await this.financeService.transferedMoney(lang, id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);

        }
    }

    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Get('cancel_transfer/:id')
    async cancelTransfer(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param("id") id: string,
    ) {
        try {
            const result = await this.financeService.cancelTransfer(lang, id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Get('/get_history_transfer')
    async getHistoryTransfer(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Query() iPage: iPageDTO,
    ) {
        try {
            iPage.length = Number(iPage.length) || 20;
            iPage.search = iPage.search || '';
            iPage.start = Number(iPage.start) || 0;
            const result = await this.financeService.getHistoryTransfer(lang, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    // Trả về 1 Transaction của KH
    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Get('get_detail_history_activity/:id')
    async getDetailHistorActivity(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Param("id") id: string,
    ) {
        try {
            const result = await this.financeService.getDetailHistorActivity(lang, user, id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
