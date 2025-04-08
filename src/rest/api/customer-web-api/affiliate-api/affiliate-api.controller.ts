import { Body, Controller, Get, HttpException, HttpStatus, Post, Query, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiTags } from '@nestjs/swagger'
import { createBankAccountDTOCustomer, DEFAULT_LANG, GetSubjectAction, GetUserByToken, IPageDecorator, iPageDTO, LANGUAGE, ValidateLangPipe } from 'src/@core'
import { CustomerSystemService } from 'src/core-system/@core-system/customer-system/customer-system.service'
import { HistoryActivitySystemService } from 'src/core-system/@core-system/history-activity-system/history-activity-system.service'
import { RandomReferralCodeSystemService } from 'src/core-system/@core-system/random-referral-code-system/random-referral-code-system.service'
import { TransactionSystemService } from 'src/core-system/@core-system/transaction-system/transaction-system.service'

@Controller('affiliate')
export class AffiliateApiController {
    constructor(
        private customerSystemService: CustomerSystemService,
        private historyActivitySystemService: HistoryActivitySystemService,
        private randomReferralCodeSystemService: RandomReferralCodeSystemService,
        private transactionSystemService: TransactionSystemService,
    ) { }

    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Get('get_list_referral_person')
    async getListOfReferralPerson(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetSubjectAction() subjectAction,
        @IPageDecorator() iPage: iPageDTO,
    ) {
        try {
            iPage.start = (iPage.start) ? iPage.start : 0;
            iPage.length = (iPage.length) ? iPage.length : 10;
            return await this.customerSystemService.getListReferralPersonByCustomer(subjectAction, iPage);
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Get('get_list_activity')
    async getListHistoryActivity(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetSubjectAction() subjectAction,
        @IPageDecorator() iPage: iPageDTO,
    ) {
        try {
            return await this.historyActivitySystemService.getListHistoryActivitiesForReferrerPerson(subjectAction, iPage);
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Get('get_random_referral_code')
    async getRandomReferralCode() {
        try {
            return await this.randomReferralCodeSystemService.getRandomReferralCode();
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Post('create_withdrawal_request')
    async createWithdrawalRequest(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetSubjectAction() subjectAction,
        @GetUserByToken() user,
        @Body() payload: { money: number }
    ) {
        try {
            return await this.transactionSystemService.createWithdrawalRequestForReferrer(lang, subjectAction, payload, user);
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Get('get_list_transaction')
    async getListTransaction(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetSubjectAction() subjectAction,
        @IPageDecorator() iPage: iPageDTO
    ) {
        try {
            return await this.transactionSystemService.getListForAffiliateProgram(lang, subjectAction, iPage);
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Get('get_total_transaction')
    async getTotalTransaction(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetSubjectAction() subjectAction,
        @IPageDecorator() iPage: iPageDTO
    ) {
        try {
            return await this.transactionSystemService.getTotalForAffiliateProgram(lang, subjectAction, iPage);
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Post('cancel_transaction/:idTransaction')
    async cancelTransaction(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query('idTransaction') idTransaction: string,
        @GetSubjectAction() subjectAction,
    ) {
        try {
            return await this.transactionSystemService.cancelTransaction(lang, subjectAction, idTransaction);
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Post('create_bank_account')
    async createBankAccount(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetSubjectAction() subjectAction,
        @Body() body: createBankAccountDTOCustomer,
    ) {
        try {
            return await this.customerSystemService.createBankAccount(lang, subjectAction, body)
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Get('check_bank_account_exist')
    async checkIfBankAccountExist(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetSubjectAction() subjectAction,
    ) {
        try {
            const result = await this.customerSystemService.checkHaveBankAccount(lang, subjectAction._id)
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
