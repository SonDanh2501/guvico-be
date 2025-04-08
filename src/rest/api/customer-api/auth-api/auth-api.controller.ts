import { Body, Controller, Get, HttpException, HttpStatus, Post, Query, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiTags } from '@nestjs/swagger'
import { DEFAULT_LANG, GetSubjectAction, GetUserByToken, GetVersion, LANGUAGE, LoginDTOCustomer, RegisterDTOCustomer, ValidateLangPipe } from 'src/@core'
import { TYPE_USER_OBJECT } from 'src/@repositories/module/mongodb/@database/enum/base.enum'
import { AuthSystemService } from 'src/core-system/@core-system/auth-system/auth-system.service'
import { CustomerSystemService } from 'src/core-system/@core-system/customer-system/customer-system.service'
import { PaymentSystemService } from 'src/core-system/@core-system/payment-system/payment-system.service'
import { PhoneOTPSystemService } from 'src/core-system/@core-system/phone-otp-system/phone-otp-system.service'
import { phoneDTO } from './../../../../@core/dto/general.dto'
@Controller('auth')
export class AuthApiController {
    constructor(
        private paymentSystemService: PaymentSystemService,
        private customerSystemService: CustomerSystemService,
        private phoneOTPSystemService: PhoneOTPSystemService,
        private authSystemService: AuthSystemService,
    ) { }
    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Get('is_link_momo')
    async checkLinkMomoCustomer(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetSubjectAction() subjectAction,
        @GetUserByToken() user
    ) {

        try {
            const result = await this.paymentSystemService.isLinkMomoCustomer(lang, user, subjectAction);
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
        @Req() request: any
    ) {
        try {
            const payload = {
                code_phone_area: body.code_phone_area,
                phone: body.phone,
                headers_request: request.headers
            };
            const result = await this.authSystemService.registerPhoneForCustomer(lang, payload);
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
            const result = await this.authSystemService.registerForCustomer(lang, body, version);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

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
    @Post('send_otp')
    async sendOTPForCustomer(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() body: { phone: string, code_phone_area: string },
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
        @Body() body: { code: string, phone: string, code_phone_area: string },
    ) {
        try {
            const result = await this.phoneOTPSystemService.checkOTP(lang, body, TYPE_USER_OBJECT.customer);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('customer')
    @Post('/forgot_password')
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
        @Body() body: {password:string, token:string},
    ) {
        try {
            const result = await this.authSystemService.updateNewPassword(lang, body);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
