import { Controller, Get, Res } from '@nestjs/common';
import { join } from 'path';

@Controller('.well-known')
export class WellKnownController {
    constructor () {}
    @Get('/assetlinks.json')
    async serveAvatar(@Res() res): Promise<any> {
      return res.sendFile('assetlinks.json', { root: join(__dirname, '../../..','public/.well-known') });
    }
}
