import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { DEFAULT_LANG, GetUserByToken, IP_VNPAY, LANGUAGE, ValidateLangPipe } from 'src/@core'
import { createPaymentMoMoDTO } from 'src/@share-module/momo/dto/momo.dto'
import { PaymentSystemService } from 'src/core-system/@core-system/payment-system/payment-system.service'
import { PaymentService } from './payment.service'

@Controller('payment')
export class PaymentController {
    constructor(
        private paymentService: PaymentService,
        private paymentSystemService: PaymentSystemService,
    ) { }
    @Get('/create_vnpay_payment_url')
    @UseGuards(AuthGuard('jwt_customer'))
    async createVnpayPaymentUrl(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Req() request: any,
    ) {
        try {
            const ipAddr = request.headers['x-real-ip'].replace("\\", "") ||
            request.headers['x-forwarded-for'] || request.ip
            console.log(request.headers, 'request.headers');
            console.log(ipAddr, 'ipAddr');
            const result = await this.paymentService.createVnpayPaymentUrl(lang, user, request);
            return result;
        }
        catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], HttpStatus.INTERNAL_SERVER_ERROR);
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

    @UseGuards(AuthGuard('jwt_customer'))
    @Get('/get_transition_with_id_view/:idView')
    async getTransitionWithIdView(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param("idView") idView: string,
        @GetUserByToken() user,
    ) {
        try {
            const result = await this.paymentService.getTransitionWithIdView(lang, user, idView);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], HttpStatus.INTERNAL_SERVER_ERROR);
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
            if (IP_VNPAY.findIndex(x => x === ipAddr) > -1) {
                const result = await this.paymentSystemService.vnpayIPN(lang, request, ipAddr);
                return res.status(200).send(result);
            } else {
                return res.status(200).send({ RspCode: '99', Message: 'Unauthorization' });
            }
        } catch (err) {
            return res.status(200).send(err);
        }
    }

    @Post('/create_momo_payment')
    @UseGuards(AuthGuard('jwt_customer'))
    async createMoMoPayment(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: createPaymentMoMoDTO,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.paymentService.createMoMoPayment(lang, req, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
