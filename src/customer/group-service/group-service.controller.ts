import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DEFAULT_LANG, iPageDTO, LANGUAGE, ValidateLangPipe } from 'src/@core';
import { GroupServiceService } from './group-service.service';

@Controller('group_service')
export class GroupServiceController {
    constructor(private groupServiceService: GroupServiceService) {}


    @Get('group_service_home')
    async getListItemHome(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageDTO,
    ) {
        const result = await this.groupServiceService.getListItemHome(lang, iPage);
        return result;
    }


    // @ApiTags('customer')
    @Get('group_service_more')
    async getListItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageDTO,
    ) {
        const result = await this.groupServiceService.getListItem(lang, iPage);
        return result;
    }
}
