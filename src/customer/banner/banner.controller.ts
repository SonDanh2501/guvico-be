import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DEFAULT_LANG, iPageDTO, LANGUAGE, ValidateLangPipe } from 'src/@core';
import { BannerService } from './banner.service';

@Controller('banner')
export class BannerController {
    constructor(
        private bannerService: BannerService,
        ) {}

        @ApiTags('customer')
        @Get('/get_list_banner')
        async getListBanner(
            @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
            @Query() iPage: iPageDTO,
        ) {
            iPage.length = Number(iPage.length) || 10;
            iPage.search = iPage.search || '';
            iPage.start = Number(iPage.start) || 0;
            const result = await this.bannerService.getListBanner(lang, iPage);
            return result;
        }
}
