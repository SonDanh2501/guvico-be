import { Body, Controller, Get, HttpException, HttpStatus, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { autoChangeMoneyCollaboratorDTO, DEFAULT_LANG, editAministrativeDTOCollaborator, editInforDTOCollaborator, GetUserByToken, GlobalService, iPageDTO, LANGUAGE, ValidateLangPipe } from 'src/@core';
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {
    constructor(
        private profileService: ProfileService,
        private globalService: GlobalService,
    ) { }

    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Post('edit_infor')
    async editInfor(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Body() req: editInforDTOCollaborator,
    ) {
        try {
            const payload = user;
            // const convertPhone = await this.globalService.convertPhone(lang, user)
            // payload.phone = convertPhone.phone;
            const result = await this.profileService.editInfor(lang, req, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }



    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Post('update_aministrative')
    async updateAministrative(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Body() req: editAministrativeDTOCollaborator,
    ) {
        try {
            const result = await this.profileService.updateAministrative(lang, req, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Get('get_list_invite')
    async getListInvite(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Query() iPage: iPageDTO
    ) {
        try {
            iPage.start = (iPage.start) ? iPage.start : 0;
            iPage.length = (iPage.length) ? iPage.length : 10;
            const result = await this.profileService.getListInvite(lang, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    @UseGuards(AuthGuard('jwt_collaborator'))
    @ApiTags('collaborator')
    @Get('get_money_from_invite')
    async getMoneyFromInvite(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Query() iPage: iPageDTO,
    ) {
        try {
            iPage.start = (iPage.start) ? iPage.start : 0;
            iPage.length = (iPage.length) ? iPage.length : 10;
            const result = await this.profileService.getMoneyFromInvite(lang, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Get('/get_info_by_token')
    async test(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user
    ) {
        try {
            const payload = user;
            const convertPhone = await this.globalService.convertPhone(lang, user)
            payload.phone = convertPhone.phone;
            const result = await this.profileService.getInfoByToken(lang, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Get('/get_total_favourite')
    async getTotalFavourite(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.profileService.getTotalFavourite(lang, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Post('/set_auto_change_money')
    async setAutoChangeMoney(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Body() req: autoChangeMoneyCollaboratorDTO
    ) {
        try {
            const result = await this.profileService.setAutoChangeMoney(lang, req, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
