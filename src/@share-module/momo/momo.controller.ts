import { Body, Controller, Get, HttpException, HttpStatus, Post, Query, Req, Res } from '@nestjs/common';
import { DEFAULT_LANG, LANGUAGE, ValidateLangPipe } from 'src/@core';
import { MomoService } from './momo.service';
import { config_momo } from './config';

@Controller('momo')
export class MomoController {
    constructor(
        private momoService: MomoService,
    ) { }

    @Post('/ipn')
    async momoIpn(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Req() res: any,
        @Body() body: any
    ) {

        try {
            const ipAddr = res.headers['x-real-ip'].replace("\\", "") ||
                res.headers['x-forwarded-for'] || res.ip
            if (config_momo.ip_access.findIndex(x => x === ipAddr) > -1) {
                const result = await this.momoService.momoIpnV2(lang, body);
                return result;
            } else {
                return res.status(200).send({ RspCode: '99', Message: 'Unauthorization' });
            }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @Post('/ipn_v2')
    async momoIpnTest(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Req() res: any,
        @Body() body: any
    ) {
        console.log('body', body)
        try {
            const ipAddr = res.headers['x-real-ip'].replace("\\", "") ||
                res.headers['x-forwarded-for'] || res.ip
            if (config_momo.ip_access.findIndex(x => x === ipAddr) > -1) {
                const result = await this.momoService.momoIpnV2(lang, body);
                return result;
            } else {
                return res.status(200).send({ RspCode: '99', Message: 'Unauthorization' });
            }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

}
