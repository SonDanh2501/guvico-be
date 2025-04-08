import { Controller, Get, Post,HttpException, HttpStatus, Query, UseGuards, Param } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiTags } from '@nestjs/swagger'
import { DEFAULT_LANG, GetSubjectAction, IPageDecorator, LANGUAGE, ValidateLangPipe } from 'src/@core'
import { iPageTransitionDTOAdmin } from 'src/@core/dto/transition.dto'
import { TransactionSystemService } from 'src/core-system/@core-system/transaction-system/transaction-system.service'

@Controller('transaction_manager')
export class TransactionManagerApiController {
    constructor(
        private transactionSystemService: TransactionSystemService
    ) { }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('get_list')
    async getListItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @IPageDecorator() iPage: iPageTransitionDTOAdmin
    ) {
        try {
            // iPage.length = Number(iPage.length) || 10;
            // iPage.start = Number(iPage.start) || 0;
            const result = await this.transactionSystemService.getListItem(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('get_total')
    async getTotalItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @IPageDecorator() iPage: iPageTransitionDTOAdmin,
    ) {
        try {
            const result = await this.transactionSystemService.getTotalTransaction(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('cancel_transaction/:idTransaction')
    async cancelTransaction(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idTransaction') idTransaction: string,
        @GetSubjectAction() subjectAction,
    ) {
        try {
            return await this.transactionSystemService.cancelTransaction(lang, subjectAction, idTransaction);
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('verify_transaction/:idTransaction')
    async verifyTransaction(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idTransaction') idTransaction: string,
        @GetSubjectAction() subjectAction,
    ) {
        try {
            return await this.transactionSystemService.verifyTransaction(lang, subjectAction, idTransaction);
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    
    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('get_list_affiliate')
    async getListItemAffiliate(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetSubjectAction() subjectAction,
        @IPageDecorator() iPage: iPageTransitionDTOAdmin
    ) {
        try  {
            return await this.transactionSystemService.getListForAffiliateProgram(lang, subjectAction, iPage);
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

}
