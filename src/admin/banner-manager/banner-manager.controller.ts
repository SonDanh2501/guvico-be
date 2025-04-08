import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { createBannerDTOAdmin, DEFAULT_LANG, editBannerDTOAdmin, deleteBannerDTOAdmin, actiBannerDTOAdmin, iPageDTO, LANGUAGE, ValidateLangPipe, createBannerImgDTOAdmin, GetUserByToken } from 'src/@core';
import { BannerManagerService } from './banner-manager.service';
import { AuthGuard } from '@nestjs/passport';
import { GlobalService } from '../../@core/service/global.service';

@Controller('banner_manager')
export class BannerManagerController {
    constructor(private bannerManagerService: BannerManagerService,
    ) { }

    @ApiTags('admin')
    @Get('get_list')
    @UseGuards(AuthGuard('jwt_admin'))
    async getListItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageDTO,
        @GetUserByToken() user
    ) {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.search = decodeURI(iPage.search || "");
            iPage.start = Number(iPage.start) || 0;
            const result = await this.bannerManagerService.getListItem(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }

    }

    @ApiTags('admin')
    @Get('get_detail_item/:id')
    @UseGuards(AuthGuard('jwt_admin'))
    async getDetailItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param("id") id: string
        // @GetUserByToken() user
    ) {
        const result = await this.bannerManagerService.getDetailItem(lang, id);
        return result;
    }

    @ApiTags('admin')
    @Post('/create_item')
    @UseGuards(AuthGuard('jwt_admin'))
    async createItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: createBannerDTOAdmin,
        @GetUserByToken() user
    ) {
        try {
            const payload = req;
            //   payload.position = payload.position || 1
            const result = await this.bannerManagerService.createItem(lang, payload, user._id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt'))
    @Post('edit_item/:id')
    async editItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
        @Body() req: editBannerDTOAdmin,
        @GetUserByToken() user
    ) {
        const result = await this.bannerManagerService.editItem(lang, req, id, user._id);
        return result;
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt'))
    @Post('acti_item/:id')
    async adminActiBanner(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
        @Body() req: actiBannerDTOAdmin,
        @GetUserByToken() user
    ) {
        const result = await this.bannerManagerService.adminActiBanner(lang, req, id, user._id);
        return result;
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt'))
    @Post('delete_item/:id')
    async adminDeleteBanner(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
        @Body() req: deleteBannerDTOAdmin,
        @GetUserByToken() user
    ) {
        const result = await this.bannerManagerService.adminDeleteBanner(lang, req, id, user._id);
        return result;
    }
}
