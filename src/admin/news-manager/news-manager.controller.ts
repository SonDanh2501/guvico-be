import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { activeNewsDTOAdmin, createNewsDTOAdmin, DEFAULT_LANG, editNewsDTOAdmin, GetUserByToken, iPageNewsDTOAdmin, LANGUAGE, ValidateLangPipe } from 'src/@core';
import { NewsManagerService } from './news-manager.service';

@Controller('news_manager')
export class NewsManagerController {
    constructor(private newsManagerService: NewsManagerService) { }

    @ApiTags('admin')
    @Get('get_list')
    @UseGuards(AuthGuard('jwt_admin'))
    async getListItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageNewsDTOAdmin,
    ) {
        iPage.length = Number(iPage.length) || 10;
        iPage.search = decodeURI(iPage.search || "");
        iPage.start = Number(iPage.start) || 0;
        const result = await this.newsManagerService.getListItem(lang, iPage);
        return result;
    }


    @ApiTags('admin')
    @Get('get_detail/:id')
    @UseGuards(AuthGuard('jwt_admin'))
    async getDetailItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
    ) {
        const result = await this.newsManagerService.getDetailItem(lang, id);
        return result;
    }

    @ApiTags('admin')
    @Post('create_item')
    @UseGuards(AuthGuard('jwt_admin'))
    async createItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: createNewsDTOAdmin,
        @GetUserByToken() user
    ) {
        try {
            const payload = req;
            payload["thumbnail"] = (payload["thumbnail"]) ? payload["thumbnail"] : "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Windows_Settings_app_icon.png/768px-Windows_Settings_app_icon.png"
            const result = await this.newsManagerService.createItem(lang, req, user._id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Post('edit_item/:id')
    @UseGuards(AuthGuard('jwt_admin'))
    async editItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
        @Body() req: editNewsDTOAdmin,
        @GetUserByToken() user
    ) {
        const result = await this.newsManagerService.editItem(lang, req, id, user._id);
        return result;
    }
    @ApiTags('admin')
    @Post('active/:id')
    @UseGuards(AuthGuard('jwt_admin'))
    async activeItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
        @Body() req: activeNewsDTOAdmin,
        @GetUserByToken() user
    ) {
        const result = await this.newsManagerService.activeItem(lang, req, id, user._id);
        // console.log('check result', result);
        return result;
    }
    @ApiTags('admin')
    @Get('delete/:id')
    @UseGuards(AuthGuard('jwt_admin'))
    async deleteItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
        @GetUserByToken() user
    ) {
        const result = await this.newsManagerService.deleteItem(lang, id, user._id);
        return result;
    }
}
