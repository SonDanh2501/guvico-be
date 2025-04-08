import { Controller, Get, HttpException, HttpStatus, Post, Query, Render, Req, Res } from '@nestjs/common';
import { DEFAULT_LANG, LANGUAGE, ValidateLangPipe } from 'src/@core';
import { VnpayService } from './vnpay.service';

@Controller('')
export class VnpayController {
    constructor(
        private vnpayService: VnpayService,
    ) { }

    // @UseGuards(AuthGuard('jwt_collaborator'))
    // @Get('/create_payment_url')
    // async createPostPaymentUrl(
    //     @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    //     // @GetUserByToken() user
    //     @Req() request: any,
    //     // @Res() res: any
    // ) {
    //     try {
    //         const result = await this.vnpayService.createPaymentUrl(lang, request);
    //         // return res.redirect(result);
    //         return result;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }

    // @Get('/vnpay_return')
    // async vnpayReturn(
    //     @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    //     @Req() request: any,
    //     @Res() res: any
    // ) {
    //     try {
    //         const result = await this.vnpayService.vnpayReturn(lang, request);
    //         // return res.redirect(result);
    //         return res.render(
    //             result
    //           );
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }

    // @Get('/vnpay_ipn')
    // async vnpayIpn(
    //     @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    //     @Req() request: any,
    //     @Res() res: any
    // ) {
    //     try {
    //         const result = await this.vnpayService.vnpayIpn(lang, request);
    //         return res.redirect(result);
    //         // return result;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }




    // ham nay dung de test tren web
    // @Get('/create_payment_url')
    // async createGetPaymentUrl(
    //     @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    //     // @GetUserByToken() user
    //     @Req() request: any,
    //     @Res() res: any
    // ) {
    //     try {
    //         const result = await this.vnpayService.createPaymentUrl(lang, request);
    //         return res.redirect(result);
    //         // return result;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }
}
