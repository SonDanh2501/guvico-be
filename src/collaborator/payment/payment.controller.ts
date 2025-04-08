import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { DEFAULT_LANG, GetUserByToken, LANGUAGE, ValidateLangPipe, iPageDTO } from 'src/@core';
import { createPaymentMoMoDTO } from 'src/@share-module/momo/dto/momo.dto';

@Controller('payment')
export class PaymentController {
    constructor(
        private paymentService: PaymentService
    ) { }
    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Post('/create_momo_payment')
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
