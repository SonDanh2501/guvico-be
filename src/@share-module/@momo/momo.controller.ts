import { Body, Controller, HttpException, HttpStatus, Post, Query, Req, Res } from '@nestjs/common'
import { DEFAULT_LANG, LANGUAGE, ValidateLangPipe } from 'src/@core'
import { config_momo } from '../momo/config'
import { MomoService } from './momo.service'

@Controller('momo')
export class MomoController {
    constructor(
        private momoService: MomoService,
    ) { }

    @Post('/ipn_link')
    async momoIpnTest(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Req() res: any,
        @Body() body: any
    ) {
        try {
            console.log('link', body)
            const ipAddr = res.headers['x-real-ip'].replace("\\", "") ||
                res.headers['x-forwarded-for'] || res.ip
            if (config_momo.ip_access.findIndex(x => x === ipAddr) > -1) {
                return true
                // const result = await this.momoService.momoIpnLink(lang, body);
                // return result;
            } else {
                return res.status(200).send({ RspCode: '99', Message: 'Unauthorization' });
            }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @Post('webhook/unbind')
  async handleUnbind(@Req() req: Request, @Res() res: Response) {
    try {
      console.log(req);
      console.log(res);
      // const secretKey = 'YOUR_SECRET_KEY';
      // const requestBody = JSON.stringify(req.body);
      
      // const signature = req.headers['x-momo-signature'];
      
      // // Kiểm tra chữ ký
      // const hash = crypto.createHmac('sha256', secretKey).update(requestBody).digest('hex');

      return
    } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
  

  }
}
