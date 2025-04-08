import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { DEFAULT_LANG, LANGUAGE, ValidateLangPipe } from 'src/@core';
import { createPopupDTOAdmin, iPagePopupDTOAdmin } from 'src/@core/dto/popup.dto';
import { PopupSystemService } from 'src/core-system/@core-system/popup-system/popup-system.service';

@Controller('popup_manager')
export class PopupManagerApiController {
    constructor(
        private popupSystemService: PopupSystemService
    ) {

    }
    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('/create_item')
    async createPopup(
        @Body() body: createPopupDTOAdmin,
    ) {
        try {
            const result = await this.popupSystemService.createPopup(body);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('/get_detail_item/:idPopup')
    async getDetailOnePopup(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idPopup') idPopup: string
    ) {
        try {
            const result = await this.popupSystemService.getDetailItem(lang, idPopup);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('/get_list_item')
    async getListPopup(
        @Query() iPage: iPagePopupDTOAdmin,
    ) {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.start = Number(iPage.start) || 0;
            const result = await this.popupSystemService.getList(iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('/update_is_active/:idPopup')
    async updateIsActivePopup(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('idPopup') idPopup: string
    ) {
        try {
            const result = await this.popupSystemService.updateIsActiveItem(lang, idPopup);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
