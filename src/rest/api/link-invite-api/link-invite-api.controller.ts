import { Body, Controller, Get, HttpException, HttpStatus, Post, Query, Req } from '@nestjs/common';
import { InviteSystemService } from 'src/core-system/@core-system/invite-system/invite-system.service';

@Controller('')
export class LinkInviteApiController {
    constructor(
        private inviteSystemService: InviteSystemService
    ) {}

    @Post('create_link_invite')
    async createNewLinkInvite(
        @Body() body: { id_bundle:string, referral_code:string },
    ) {
        try {
            return await this.inviteSystemService.createNewLinkInvite(body);
        } catch (err) {
            throw new HttpException(err.response || [{message: err.toString(), field: null}], HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('get_link_invite')
    async getLinkInvite(
        @Query('id_bundle') id_bundle:string
    ) {
        try {
            return await this.inviteSystemService.getLinkInvite(id_bundle);
        } catch (err) {
            throw new HttpException(err.response || [{message: err.toString(), field: null}], HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
