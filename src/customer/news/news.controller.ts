import { Controller, Get, Query } from '@nestjs/common';
import { DEFAULT_LANG, iPageDTO, iPageNewsDTOCustomer, LANGUAGE, ValidateLangPipe } from 'src/@core';
import { NewsService } from './news.service';

@Controller('news')
export class NewsController {
    constructor(private newsService: NewsService) {}

    @Get('/guvilover')
    async getListGuviLover(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        // @Query("page") page: number,
        @Query() iPage: iPageNewsDTOCustomer,
    ) {
        // page = page || 1;
        iPage.start = iPage.start || 0;
        iPage.length = iPage.length || 10;
        const result = await this.newsService.getGuviLover(lang, iPage);
        return result;
    }

    @Get('/news')
    async getListNews(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        // @Query("page") page: number,
        @Query() iPage: iPageNewsDTOCustomer,
    ) {
        // page = page || 1;
        iPage.start = iPage.start || 0;
        iPage.length = iPage.length || 10;
        const result = await this.newsService.getListNews(lang, iPage);
        return result;
    }
}
