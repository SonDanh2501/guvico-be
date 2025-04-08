import { Body, Controller, Get, HttpException, HttpStatus, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { DEFAULT_LANG, GetUserByToken, GlobalService, LANGUAGE, LoginDTOCollaborator, editInforDTOCollaborator, newPasswordDTOCustomer, OTPCheckDTOCollaborator, OTPCheckDTOCustomer, phoneDTO, RegisterDTOCollaborator, RegisterDTOCustomer, ValidateLangPipe, RegisterV2DTOCollaborator, ChangePasswordDTOCollaborator, ERROR } from 'src/@core';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';


@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private globalService: GlobalService,
    ) { }

    @ApiTags('collaborator')
    @Post('/check_OTP')
    async checkOTP(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: OTPCheckDTOCollaborator,
    ) {
        try {
            const payload = req;
            const convertPhone = await this.globalService.convertPhone(lang, req)
            payload.phone = convertPhone.phone;
            const result = await this.authService.checkOTP(lang, payload);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('collaborator')
    @Post('/register_phone')
    async registerPhone(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: phoneDTO,
        @Req() request: any
    ) {
        try {

            const payload = {
                code_phone_area: req.code_phone_area,
                phone: req.phone,
                headers_request: request.headers
            };
            const convertPhone = await this.globalService.convertPhone(lang, req)
            payload.phone = convertPhone.phone;
            const result = await this.authService.registerPhone(lang, payload);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('collaborator')
    @Post('/forgot_password')
    async forgotPassword(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: phoneDTO,
        @Req() request: any
    ) {
        try {
            // const payload = req;
            const payload = {
                code_phone_area: req.code_phone_area,
                phone: req.phone,
                headers_request: request.headers
            };
            const convertPhone = await this.globalService.convertPhone(lang, req)
            payload.phone = convertPhone.phone;
            const result = await this.authService.forgotPassword(lang, payload);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('collaborator')
    @Post('/new_password')
    async newPassword(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: newPasswordDTOCustomer
    ) {
        try {
            const result = await this.authService.newPassword(lang, req);
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
            return await this.authService.getInfoByToken(lang, user);
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Post('/delete_account')
    async deleteAccount(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.authService.deleteAccount(lang, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('collaborator')
    @Post('/register_v2')
    async registerV2(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: RegisterV2DTOCollaborator
    ) {
        try {
            req.email = (req.email) ? req.email : "";
            const result = await this.authService.registerV2(lang, req);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);

        }
    }

    @ApiTags('collaborator')
    @Post('/login_v2')
    async loginV2(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: LoginDTOCollaborator) {
        try {
            const payload = req;
            const convertPhone = await this.globalService.convertPhone(lang, req)
            payload.phone = convertPhone.phone;
            const result = await this.authService.loginV2(lang, payload);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('collaborator')
    @Post('change_password')
    @UseGuards(AuthGuard('jwt_collaborator'))
    async changePassword(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: ChangePasswordDTOCollaborator,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.authService.changePassword(lang, req, user._id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);

        }
    }

    @ApiTags('collaborator')
    @Post('check_phone')
    async checkPhone(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: phoneDTO
    ) {
        try {
            const result = await this.authService.checkPhone(lang, req)
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);

        }
    }

    @ApiTags('collaborator')
    @Post('change_new_password')
    @UseGuards(AuthGuard('jwt_collaborator'))
    async changeNewPassword(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: ChangePasswordDTOCollaborator,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.authService.changeNewPassword(lang, req, user._id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);

        }//
    }//
}
