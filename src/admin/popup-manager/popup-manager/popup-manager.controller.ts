import { Controller, UseGuards, Post, Query, Body, HttpException, HttpStatus, Param, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { PopupManagerService } from './popup-manager.service';
import { ValidateLangPipe } from '../../../@core/pipe/validate-lang.pipe';
import { DEFAULT_LANG, LANGUAGE } from '../../../@core/constant/constant';
import { GetUserByToken } from 'src/@core';
import { createPopupDTOAdmin, iPagePopupDTOAdmin } from 'src/@core/dto/popup.dto';


@Controller('popup-manager')
export class PopupManagerController {
    constructor(
        private popupManagerService: PopupManagerService
    ) { }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('/create_item')
    async createItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Body() req: createPopupDTOAdmin
    ) {
        try {
            const result = await this.popupManagerService.createItem(lang, req, user._id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);

        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('/edit_item/:id')
    async editItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Body() req: createPopupDTOAdmin,
        @Param('id') id: string
    ) {
        try {
            const result = await this.popupManagerService.editItem(lang, req, id, user._id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);

        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('/delete_item/:id')
    async deleteItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Param('id') id: string
    ) {
        try {
            const result = await this.popupManagerService.deleteItem(lang, id, user._id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);

        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('/active_item/:id')
    async activeItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Param('id') id: string
    ) {
        try {
            const result = await this.popupManagerService.activeItem(lang, id, user._id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);

        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('/change_status/:id')
    async changeStatusItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Param('id') id: string,
        @Query('status') status: string
    ) {
        try {
            const result = await this.popupManagerService.changeStatusItem(lang, id, status, user._id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);

        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('/get_list')
    async getList(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Query() iPage: iPagePopupDTOAdmin
    ) {
        try {
            iPage.status = (iPage.status) ? iPage.status : "all";
            const result = await this.popupManagerService.getList(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);

        }
    }
}
