import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { iPageDTO } from 'src/@core';
import { ClickLinkManagerService } from './click-link-manager.service';

@Controller('click-link-manager')
export class ClickLinkManagerController {
    constructor(private clickLinkManagerService: ClickLinkManagerService) { }

    @ApiTags('admin')
    @Get('get_list')
    @UseGuards(AuthGuard('jwt_admin'))
    async getListItem(
        @Query() iPage: iPageDTO,
        // @GetUserByToken() user
    ) {
        iPage.length = Number(iPage.length) || 10;
        iPage.search = decodeURI(iPage.search || "");
        iPage.start = Number(iPage.start) || 0;
        const result = await this.clickLinkManagerService.getListItem(iPage);
        return result;
    }
}
