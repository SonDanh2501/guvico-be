import { Body, Controller, HttpException, HttpStatus, Post, Query, Req } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { DEFAULT_LANG, LANGUAGE, ValidateLangPipe } from 'src/@core'
import { config_momo } from 'src/@share-module/@momo/config'
import { GroupOrderSystemService2 } from 'src/core-system/@core-system/group-order-system/group-order-system.service'
import { JobSystemService } from 'src/core-system/@core-system/job-system/job-system.service'
import { MomoSystemService } from 'src/core-system/@core-system/momo-system/momo-system.service'
import { OrderSystemService2 } from 'src/core-system/@core-system/order-system/order-system.service'

const configMomo:any = config_momo
// const configMomo:any = config_momo_test
// const configMomo:any = config_momo_dev
@Controller('momo')
export class MomoApiController {
    constructor(
        private momoSystemService: MomoSystemService,
        private jobSystemService: JobSystemService,
        private orderSystemService2: OrderSystemService2,
        private groupOrderSystemService2: GroupOrderSystemService2,
    ) { }
    @ApiTags('customer')
    @Post('ipn_link')
    async handleMomoIpnTest(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Req() req: any,
        @Body() body: any
    ) {
        try {
            const ipAddr = req.headers['x-real-ip'].replace("\\", "") ||
                req.headers['x-forwarded-for'] || req.ip
            if (configMomo.ip_access.findIndex((x) => x === ipAddr) > -1) {
                if (body.resultCode === 9000) {
                    await this.jobSystemService.processingToPending(lang, body, false)
                }  else if (body.resultCode === 0) {
                    await this.jobSystemService.processingToPending(lang, body, true)
                }
                // const result = await this.momoSystemService.handleMomoIpnLink(lang, body);

                
                return true;
            } else {
                return req.status(200).send({ RspCode: '99', Message: 'Unauthorization' });
            }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    // @ApiTags('customer')
    // @Post('create_link_mono')
    // async test(
    //     @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    //     // @Req() res: any,
    //     // @Body() body: any
    // ) {
    //     try {

    //         const body = {
    //             partnerCode: 'MOMOQNZ120231003',
    //             orderId: '670391e5666c1e64f295542e',
    //             requestId: '670391e5666c1e64f295542e',
    //             amount: 0,
    //             orderInfo: 'KH00029425792024IIZ',
    //             orderType: 'momo_wallet',
    //             transId: 1728287214080,
    //             resultCode: 0,
    //             message: 'Thành công.',
    //             payType: 'app',
    //             responseTime: 1728287214085,
    //             extraData: 'eyJmdWxsX25hbWUiOiJIdXlEZXYiLCJwaG9uZSI6IjAzNjg4ODQ4MTYiLCJjb2RlX3Bob25lX2FyZWEiOiIrODQiLCJkYXRlX2NyZWF0ZSI6IjIwMjQtMTAtMDdUMDc6NDY6NDUuNjk4WiIsImFtb3VudCI6MCwiaWRfb3JkZXIiOiJLSDAwMDI5NDI1NzkyMDI0SUlaIn0=',
    //             signature: '2a7c982a000d2e7cdf286715bb9d10872701f0b9d4244455708149a5d8fb741e',
    //             callbackToken: 'Q4UoCp0CzlJg7NDAsczQJw0gwtLljm23Y2U53QQTujTdKd9l',
    //             partnerClientId: '66723661b3898ff2331b98fe'
    //         }



    //         // const ipAddr = res.headers['x-real-ip'].replace("\\", "") ||
    //         //     res.headers['x-forwarded-for'] || res.ip
    //         // if (config_momo.ip_access.findIndex(x => x === ipAddr) > -1) {
    //         const result = await this.momoSystemService.momoIpnLink(lang, body);

    //         return result;
    //         // } else {
    //         //     return res.status(200).send({ RspCode: '99', Message: 'Unauthorization' });
    //         // }
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }

    @ApiTags('customer')
    @Post('handle_momo_payment')
    async handleMomoPayment(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Req() req: any,
        @Body() body: any
    ) {
        try {
            const ipAddr = req.headers['x-real-ip'].replace("\\", "") ||
                req.headers['x-forwarded-for'] || req.ip
            if (configMomo.ip_access.findIndex((x) => x === ipAddr) > -1) {                    
                if (body.resultCode === 9000) {
                    return await this.jobSystemService.processingToPending(lang, body, false)
                } 
                if (body.resultCode === 0) {
                    return await this.jobSystemService.processingToPending(lang, body, true)
                }
                if (body.resultCode === 7000 || body.resultCode === 7002) {
                    return true
                }

                let subjectAction ={
                    type: 'system'
                }

                const stepCancel = {
                    isCancel: true,
                    isRefundCustomer: false,
                    isRefundCollaborator: false,
                    isPunishCollaborator: false,
                    isPunishCustomer: false,
                    isUnassignCollaborator: false,
                    isMinusNextOrderCollaborator: false
                }

                const idCancel = '6721e4312d7b05edb4f58734'
                await this.groupOrderSystemService2.cancelGroupOrder(lang, subjectAction, body.orderId, idCancel, stepCancel, true)
                
                return true;
            } else {
                return req.status(200).send({ RspCode: '99', Message: 'Unauthorization' });
            }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
