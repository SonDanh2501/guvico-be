import { Body, Controller, Get, HttpException, HttpStatus, Post, Query, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiTags } from '@nestjs/swagger'
import { DEFAULT_LANG, GetSubjectAction, GetVersion, LANGUAGE, LoginDTOCustomer, phoneDTO, RegisterDTOCustomer, ValidateLangPipe } from 'src/@core'
import { TYPE_USER_OBJECT } from 'src/@repositories/module/mongodb/@database/enum/base.enum'
import { AuthSystemService } from 'src/core-system/@core-system/auth-system/auth-system.service'
import { CustomerSystemService } from 'src/core-system/@core-system/customer-system/customer-system.service'
import { PhoneOTPSystemService } from 'src/core-system/@core-system/phone-otp-system/phone-otp-system.service'

@Controller('auth')
export class AuthApiController {
    constructor(
        private customerSystemService: CustomerSystemService,
        private phoneOTPSystemService: PhoneOTPSystemService,
        private authSystemService: AuthSystemService,
    ) { }

    @ApiTags('customer')
    @Post('login')
    async login(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() payload: LoginDTOCustomer,
    ) {
        try {
            const result = await this.authSystemService.loginForCustomer(lang, payload);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('customer')
    @Post('register_phone')
    async registerPhone(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() body: phoneDTO,
    ) {
        try {
            const result = await this.authSystemService.registerPhoneForCustomer(lang, body);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('customer')
    @Post('register')
    async register(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() body: RegisterDTOCustomer,
        @GetVersion() version
    ) {
        try {
            const result = await this.authSystemService.registerForCustomer(lang, body, version, true);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('customer')
    @Post('send_otp')
    async sendOTP(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() body: phoneDTO,
        @Req() request: any
    ) {
        try {
            const payload = {
                code_phone_area: body.code_phone_area,
                phone: body.phone,
                headers_request: request.headers
            };
            const result = await this.customerSystemService.sendOTP(lang, payload);
            return result
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('customer')
    @Post('check_otp')
    async checkOTP(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() body: phoneDTO & { code: string },
    ) {
        try {
            const result = await this.phoneOTPSystemService.checkOTP(lang, body, TYPE_USER_OBJECT.customer);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('customer')
    @Post('forgot_password')
    async forgotPassword(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() body: phoneDTO,
        @Req() request: any
    ) {
        try {
            const payload = {
                code_phone_area: body.code_phone_area,
                phone: body.phone,
                headers_request: request.headers
            };
            const result = await this.authSystemService.forgotPasswordForCustomer(lang, payload);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('customer')
    @Post('update_new_password')
    async updateNewPassword(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() body: { password: string, token: string },
    ) {
        try {
            const result = await this.authSystemService.updateNewPassword(lang, body);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Post('update_referral_code')
    async updateReferralCode(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetSubjectAction() subjectAction,
        @Body() body: { referral_code: string },
    ) {
        try {
            return await this.authSystemService.updateReferralCode(lang, subjectAction, body.referral_code);
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Get('get_customer_info')
    async getCustomerInfo(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetSubjectAction() subjectAction,
    ) {
        try {
            const result = await this.customerSystemService.getCustomerInfo(lang, subjectAction._id);
            return result
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Post('check_old_password')
    async checkOldPassword(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetSubjectAction() subjectAction,
        @Body() payload: { password: string }
    ) {
        try {
            const result = await this.authSystemService.checkOldPasswordForCustomer(lang, subjectAction, payload);
            return result
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Post('change_password')
    async changePassword(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetSubjectAction() subjectAction,
        @Body() payload: { new_password: string, confirm_password: string }
    ) {
        try {
            const result = await this.authSystemService.changePasswordForCustomer(lang, subjectAction, payload);
            return result
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
