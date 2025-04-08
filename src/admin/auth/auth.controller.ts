import { Body, Controller, Get, HttpException, HttpStatus, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ChangePasswordAdminDto, DEFAULT_LANG, GetUserByToken, LANGUAGE, LoginAdminDto, ValidateLangPipe } from 'src/@core';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';


@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }
    @ApiTags('admin')
    @Post('login')
    async login(
        @Body() loginDto: LoginAdminDto,
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    ) {
        try {
            const result = await this.authService.login(lang, loginDto);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    @Post('forgotPassword')
    async forgotPassword(@Body() payload: any) {

    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('/get_info_by_token')
    async getInfoByToken(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.authService.getInfoByToken(lang, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Get('/get_permission_by_token')
    async getPermissionByToken(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.authService.getPermissionByToken(lang, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @UseGuards(AuthGuard('jwt_admin'))
    @Post('/change_password')
    async changePassword(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Body() payload: ChangePasswordAdminDto, 
    ) {
        try {
            const result = await this.authService.changePassword(lang, user, payload);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


}
