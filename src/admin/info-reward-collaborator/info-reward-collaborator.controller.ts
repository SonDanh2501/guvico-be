import { Controller, Get, HttpException, Query, HttpStatus, UseGuards, Post, Body, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DEFAULT_LANG, GetUserByToken, LANGUAGE, ValidateLangPipe, iPageDTO, iPageInfoRewardCollaborator } from 'src/@core';
import { InfoRewardCollaboratorService } from './info-reward-collaborator.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('info_reward_collaborator')
export class InfoRewardCollaboratorController {
    constructor(
        private infoRewardCollaboratorService: InfoRewardCollaboratorService,

    ) { }
    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('get_list')
    async getListItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageInfoRewardCollaborator,
    ) {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.search = decodeURI(iPage.search || "");
            iPage.start = Number(iPage.start) || 0;
            iPage.status = (iPage.status) ? iPage.status : 'all';
            const result = await this.infoRewardCollaboratorService.getListItem(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('create_item')
    async createItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.infoRewardCollaboratorService.createItem(lang, req, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('detail_item/:id')
    async getDetailItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Param('id') id: string
    ) {
        try {
            const result = await this.infoRewardCollaboratorService.getDetailItem(lang, id, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('delete_item/:id')
    async deteleItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Param('id') id: string
    ) {
        try {
            const result = await this.infoRewardCollaboratorService.deteleItem(lang, id, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('verify_item/:id')
    async verifyItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Param('id') id: string
    ) {
        try {
            const result = await this.infoRewardCollaboratorService.verifyItem(lang, id, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('cancel_item/:id')
    async cancelItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Param('id') id: string,
        @Body() req
    ) {
        try {
            const result = await this.infoRewardCollaboratorService.cancelItem(lang, id, req, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('note_admin_item/:id')
    async noteAdminItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Param('id') id: string,
        @Body() req
    ) {
        try {
            const result = await this.infoRewardCollaboratorService.noteAdminItem(lang, id, req, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
