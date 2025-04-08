import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { DEFAULT_LANG, GetUserByToken, GlobalService, iPageDTO, LANGUAGE, ValidateLangPipe } from 'src/@core';
import { ProfileService } from './profile.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@Controller('profile')
export class ProfileController {
    constructor(
        private profileService: ProfileService,
        private globalService: GlobalService
    ) { }

    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
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

    @UseGuards(AuthGuard('jwt_customer'))
    @ApiTags('customer')
    @Get('get_history_points')
    async getHistoryPoints(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageDTO,
        @GetUserByToken() user
    ) {
        iPage.length = Number(iPage.length) || 10;
        iPage.search = iPage.search || '';
        iPage.start = Number(iPage.start) || 0;
        const result = await this.profileService.getHistoryPoints(lang, iPage, user);
        return result;
    }

    @UseGuards(AuthGuard('jwt_customer'))
    @ApiTags('customer')
    @Get('get_history_points_v2')
    async getHistoryPointsV2(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageDTO,
        @GetUserByToken() user
    ) {
        iPage.length = Number(iPage.length) || 10;
        iPage.search = iPage.search || '';
        iPage.start = Number(iPage.start) || 0;
        const result = await this.profileService.getHistoryPointsV2(lang, iPage, user);
        return result;
    }

    // @UseGuards(AuthGuard('jwt_customer'))
    // @ApiTags('customer')
    // @Post('add_code_inviter/:idCode')
    // async addCodeInviter(
    //     @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    //     @Param("idCode") idCode: string,
    //     @GetUserByToken() user
    // ) {
    //     try {
    //         const result = await this.profileService.addCodeInviter(lang, idCode, user._id);
    //         return true;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{message: err.toString(), field: null}], HttpStatus.FORBIDDEN);
    //     }
    // }
    @UseGuards(AuthGuard('jwt_customer'))
    @ApiTags('customer')
    @Post('block_collaborator/:idCollaborator')
    async blockCollaborator(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param("idCollaborator") idCollaborator: string,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.profileService.blockCollaborator(lang, idCollaborator, user._id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @UseGuards(AuthGuard('jwt_customer'))
    @ApiTags('customer')
    @Post('unblock_collaborator/:idCollaborator')
    async unblockCollaborator(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param("idCollaborator") idCollaborator: string,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.profileService.unblockCollaborator(lang, idCollaborator, user._id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @UseGuards(AuthGuard('jwt_customer'))
    @ApiTags('customer')
    @Get('get_list_block_collaborator')
    async getListblockCollaborator(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param("idCollaborator") idCollaborator: string,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.profileService.getListBlockCollaborator(lang, user._id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @UseGuards(AuthGuard('jwt_customer'))
    @ApiTags('customer')
    @Post('add_favourite_collaborator/:idCollaborator')
    async addFavouriteCollaborator(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param("idCollaborator") idCollaborator: string,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.profileService.addFavouriteCollaborator(lang, idCollaborator, user._id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @UseGuards(AuthGuard('jwt_customer'))
    @ApiTags('customer')
    @Post('unfavourite_collaborator/:idCollaborator')
    async unFavouriteCollaborator(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param("idCollaborator") idCollaborator: string,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.profileService.unFavouriteCollaborator(lang, idCollaborator, user._id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @UseGuards(AuthGuard('jwt_customer'))
    @ApiTags('customer')
    @Get('get_list_favourite_collaborator')
    async getListFavouriteCollaborator(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param("idCollaborator") idCollaborator: string,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.profileService.getListFavouriteCollaborator(lang, user._id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @UseGuards(AuthGuard('jwt_customer'))
    @ApiTags('customer')
    @Get('get_list_customer_invite')
    async getListCustomerInvite(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Query() iPage: iPageDTO,
    ) {
        try {
            iPage.start = (iPage.start) ? iPage.start : 0;
            iPage.length = (iPage.length) ? iPage.length : 10;
            const result = await this.profileService.getListCustomerInvite(lang, iPage, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @UseGuards(AuthGuard('jwt_customer'))
    @ApiTags('customer')
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
    @UseGuards(AuthGuard('jwt_customer'))
    @ApiTags('customer')
    @Get('get_info_collaborator/:idCollaborator')
    async getInfoCollaborator(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Param('idCollaborator') idCollaborator: string,
    ) {
        try {
            const result = await this.profileService.getInfoCollaborator(lang, idCollaborator);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
