import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { TransactionManagerService } from './transaction-manager.service';
import { ApiTags } from '@nestjs/swagger';
import { DEFAULT_LANG, GetUserByToken, IPageDecorator, IPageTransitionDecorator, LANGUAGE, ValidateLangPipe, iPageDTO } from 'src/@core';
import { AuthGuard } from '@nestjs/passport';
import { createTransactionDTO, iPageTransactionDTOAdmin } from 'src/@core/dto/transaction.dto';

@Controller('transaction_manager')
export class TransactionManagerController {
    constructor(
        private transactionManagerService: TransactionManagerService,
    ) { }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('get_list')
    async getListItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @IPageTransitionDecorator() iPage: iPageTransactionDTOAdmin,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.transactionManagerService.getListItem(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiTags('admin')
    @Post('/create_item')
    @UseGuards(AuthGuard('jwt_admin'))
    async createItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() payload: createTransactionDTO,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.transactionManagerService.createItem(lang, payload, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiTags('admin')
    @Post('/delete_item/:id')
    @UseGuards(AuthGuard('jwt_admin'))
    async deleteItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') idTransaction,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.transactionManagerService.deleteItem(lang, idTransaction, user._id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiTags('admin')
    @Post('/cancel_item/:id')
    @UseGuards(AuthGuard('jwt_admin'))
    async cancelItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') idTransaction,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.transactionManagerService.cancelItem(lang, idTransaction, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiTags('admin')
    @Post('/verify_item/:id')
    @UseGuards(AuthGuard('jwt_admin'))
    async verifyItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') idTransaction,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.transactionManagerService.verifyItem(lang, user, idTransaction);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiTags('admin')
    @Get('/detail_item/:id')
    @UseGuards(AuthGuard('jwt_admin'))
    async DetailItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') idTransaction,
    ) {
        try {
            const result = await this.transactionManagerService.detailItem(lang, idTransaction);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiTags('admin')
    @Get('/get_activity_history_transaction/:id')
    @UseGuards(AuthGuard('jwt_admin'))
    async getActivityHistoryTransaction(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @IPageDecorator() iPage: iPageDTO,
        @Param("id") idTransaction: string
    ) {
        try {
            const result = await this.transactionManagerService.getActivityHistoryTransaction(lang, iPage, idTransaction);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('get_total')
    async getTotal(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @IPageTransitionDecorator() iPage: iPageTransactionDTOAdmin,
        @GetUserByToken() user
    ) {
        try {

            const result = await this.transactionManagerService.totalTransaction(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('get_total_transaction_customer')
    async getTotalTransactionCustomer(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @IPageTransitionDecorator() iPage: iPageTransactionDTOAdmin,
        @GetUserByToken() user
    ) {
        try {

            const result = await this.transactionManagerService.totalTransactionCustomer(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('get_total_money/:key')
    async getTotalMoney(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @IPageTransitionDecorator() iPage: iPageTransactionDTOAdmin,
        @GetUserByToken() user,
        @Param('key') key: string
    ) {
        try {
            const result = await this.transactionManagerService.totalMoneyTransaction(lang, iPage, key);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('get_total_transaction_staff')
    async getTotalTransactionStaff(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @IPageTransitionDecorator() iPage: iPageTransactionDTOAdmin,
        @GetUserByToken() user
    ) {
        try {

            const result = await this.transactionManagerService.totalTransactionStaff(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
