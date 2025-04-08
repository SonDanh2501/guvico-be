import { Controller, Get, HttpException, HttpStatus, Post, Query, Req } from '@nestjs/common';
import { LinkInviteService } from './link-invite.service';

@Controller('')
export class LinkInviteController {
    constructor(
        private linkInviteService: LinkInviteService,
        ) {}

        @Post('set_invite')
        async setInvite(
            @Query('code') code: string,
            @Req() request: any,
        ) {
            try {
                const ipAddr = (request.headers['x-real-ip']) ? request.headers['x-real-ip'].replace("\\", "") :
                request.headers['x-forwarded-for'] ||
                request.connection.remoteAddress ||
                request.socket.remoteAddress ||
                request.connection.socket.remoteAddress
                console.log('--------- set invite --------');
                console.log(request.body, 'request.body');
                console.log(ipAddr, 'ipAddr');
                console.log(code, 'code');
                console.log('--------- set invite --------');
                const result = await this.linkInviteService.setDeviceReferred(code, request.body, ipAddr);
                // return result;
                return true;
            } catch (err) {
                throw new HttpException(err.response || [{message: err.toString(), field: null}], HttpStatus.FORBIDDEN);
            }
        }

        @Post('get_invite')
        async getInvite(
            // @Query('code') code: string,
            @Req() request: any,
        ) {
            try {
                const ipAddr = (request.headers['x-real-ip']) ? request.headers['x-real-ip'].replace("\\", "") :
                request.headers['x-forwarded-for'] ||
                request.connection.remoteAddress ||
                request.socket.remoteAddress ||
                request.connection.socket.remoteAddress
                console.log('--------- get invite --------');
                console.log(request.body, 'request.body');
                console.log(ipAddr, 'ipAddr');
                console.log('--------- get invite --------');
                const result = await this.linkInviteService.getDeviceReferred(request.body, ipAddr);
                return result;
            } catch (err) {
                throw new HttpException(err.response || [{message: err.toString(), field: null}], HttpStatus.FORBIDDEN);
            }
        }
}
