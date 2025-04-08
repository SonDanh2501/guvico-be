import { Body, Controller, Get, HttpException, HttpStatus, Post, Query, Req, Res, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiTags } from '@nestjs/swagger'
import { DEFAULT_LANG, GetSubjectAction, GetUserByToken, IP_VNPAY, LANGUAGE, ValidateLangPipe } from 'src/@core'
import { createTransactionDTO } from 'src/@core/dto/transaction.dto'
import { PAYMENT_ENUM, TYPE_TRANSFER, TYPE_WALLET } from 'src/@repositories/module/mongodb/@database/enum'
import { createPaymentDTO } from 'src/@share-module/momo/dto/momo.dto'
import { CustomerSystemService } from 'src/core-system/@core-system/customer-system/customer-system.service'
import { PaymentSystemService } from 'src/core-system/@core-system/payment-system/payment-system.service'

const IP_VNPAY_CONFIG = IP_VNPAY
// const IP_VNPAY_CONFIG = IP_VNPAY_TEST

@Controller('payment')
export class PaymentApiController {
    constructor(
        private paymentService: PaymentSystemService,
        private customerService: CustomerSystemService,
    ) { }


    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Post('create_link_mono')
    async createLinkMomo(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: createPaymentDTO,
        @GetSubjectAction() subjectAction,
        @GetUserByToken() user
    ) {

        try {
            const payload: createTransactionDTO = {
                id_customer: subjectAction._id,
                money: req.money,
                subject: subjectAction.type,
                transfer_note: null,
                type_transfer: TYPE_TRANSFER.confirm_payment,
                payment_out: PAYMENT_ENUM.momo,
                payment_in: PAYMENT_ENUM.momo,
                type_wallet: TYPE_WALLET.pay_point
            }
            const result = await this.paymentService.createLinkPayment(lang, payload, subjectAction, user);

            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Post('cancale_link_momo')
    async createMoMoPayment(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: createPaymentDTO,
        @GetSubjectAction() subjectAction,
        @GetUserByToken() user
    ) {
        try {
            const payload: createTransactionDTO = {
                id_customer: subjectAction._id,
                money: req.money,
                subject: subjectAction.type,
                transfer_note: null,
                type_transfer: TYPE_TRANSFER.confirm_payment,
                payment_out: PAYMENT_ENUM.momo,
                payment_in: PAYMENT_ENUM.momo,
                type_wallet: TYPE_WALLET.pay_point
            }
            const result = await this.paymentService.cleanlTokenPayment(lang, payload, subjectAction, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Post('/set_default_payment_method')
    async setDefaultPaymentMethod(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() body: { type_payment_method: string },
        @GetUserByToken() user
    ) {

        try {
            return await this.customerService.setDefaultPaymentMethod(lang, user._id, body.type_payment_method);
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @Get('/vnpay_return')
    async vnpayReturn(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Req() request: any,
        @Res() res: any,
    ) {
        try {
            const result = await this.paymentService.vnpayReturn(lang, request);
            return res.view(result)
        } catch (err) {
            return res.view("error")
        }
    }

    @Get('/vnpay_ipn')
    async vnpayIPN(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Req() request: any,
        @Res() res: any,
    ) {
        try {
            const ipAddr = request.headers['x-real-ip'].replace("\\", "") ||
                request.headers['x-forwarded-for'] || request.ip
            console.log(ipAddr, 'ipAddr');
            if (IP_VNPAY_CONFIG.findIndex(x => x === ipAddr) > -1) {
                const result = await this.paymentService.vnpayIPN(lang, request, ipAddr);
                return res.status(200).send(result);
            } else {
                return res.status(200).send({ RspCode: '99', Message: 'Unauthorization' });
            }
        } catch (err) {
            return res.status(200).send(err);
        }
    }

    @ApiTags('customer')
    @Get('/create_top_up_link')
    @UseGuards(AuthGuard('jwt_customer'))
    async createTopUpLink(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @GetSubjectAction() subjectAction,
        @Req() request: any,
    ) {
        try {
            const ipAddr = request.headers['x-real-ip'].replace("\\", "") ||
                request.headers['x-forwarded-for'] || request.ip
            console.log(request.headers, 'request.headers');
            console.log(ipAddr, 'ipAddr');
            const result = await this.paymentService.createTopUpLink(lang, subjectAction, request, user);
            return result;
        }
        catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 