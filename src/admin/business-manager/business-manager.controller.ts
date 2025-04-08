import { Controller, Get, UseGuards, HttpException, HttpStatus, Query, Body, Param, Post } from '@nestjs/common';
import { BusinessManagerService } from './business-manager.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { DEFAULT_LANG, GetUserByToken, LANGUAGE, ValidateLangPipe, createBannerDTOAdmin, iPageDTO } from 'src/@core';
import { actiBusinessDTOAdmin, createBusinessDTOAdmin, editBusinessDTOAdmin } from 'src/@core/dto/business.dto';

@Controller('business_manager')
export class BusinessManagerController {
    constructor(
        private businessManagerService: BusinessManagerService,
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
            const result = await this.businessManagerService.getListItem(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    @ApiTags('admin')
    @Get('get_detail/:id')
    @UseGuards(AuthGuard('jwt_admin'))
    async getDetailItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param("id") id: string,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.businessManagerService.getDetailItem(lang, id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Post('/create_item')
    @UseGuards(AuthGuard('jwt_admin'))
    async createItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: createBusinessDTOAdmin,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.businessManagerService.createItem(lang, req, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('edit_item/:id')
    async editItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
        @Body() req: editBusinessDTOAdmin,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.businessManagerService.editItem(lang, req, id, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }

    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('acti_item/:id')
    async adminActiBanner(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
        @Body() req: actiBusinessDTOAdmin,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.businessManagerService.actiItem(lang, req, id, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt'))
    @Post('delete_item/:id')
    async deleteItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.businessManagerService.deleteItem(lang, id, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
