import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiTags } from '@nestjs/swagger'
import { DEFAULT_LANG, editInforDTOCustomer, GetUserByToken, GlobalService, LANGUAGE, LoginDTOCustomer, newPasswordDTOCustomer, OTPCheckDTOCustomer, phoneDTO, ValidateLangPipe } from 'src/@core'
import { changePasswordDTOCustomer } from '../../@core/dto/customer.dto'
import { AuthService } from './auth.service'
@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private globalService: GlobalService,
    ) { }


    @ApiTags('customer')
    @Post('/login')
    async login(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: LoginDTOCustomer) {
        try {
            const payload = req;
            const convertPhone = await this.globalService.convertPhone(lang, req)
            payload.phone = convertPhone.phone;
            const result = await this.authService.login(lang, payload);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    // @UseInterceptors(CustomerInterceptor)
    // @ApiTags('customer')
    // @Post('/register')
    // async register(
    //     @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    //     @Body() req: RegisterDTOCustomer
    // ) {
    //     try {
    //         const payload = req;
    //         payload.date_create = new Date().toISOString();
    //         payload.email = (payload.email) ? payload.email : "";
    //         payload.salt = await bcrypt.genSalt();
    //         const result = await this.authService.register(lang, payload);
    //         return result;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }

    @ApiTags('customer')
    @Post('/check_OTP')
    async checkOTP(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: OTPCheckDTOCustomer,
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

    @ApiTags('customer')
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

            console.log(payload, 'payload_register_phone');
            
            const convertPhone = await this.globalService.convertPhone(lang, req)
            payload.phone = convertPhone.phone;
            const result = await this.authService.registerPhone(lang, payload);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('customer')
    @Post('/forgot_password')
    async forgotPassword(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: phoneDTO,
        @Req() request: any
    ) {
        const payload = {
            code_phone_area: req.code_phone_area,
            phone: req.phone,
            headers_request: request.headers
        };
        console.log(payload, 'payload_forgot_password');
        const convertPhone = await this.globalService.convertPhone(lang, req)
        payload.phone = convertPhone.phone;
        const result = await this.authService.forgotPassword(lang, payload);
        return result;
    }

    @ApiTags('customer')
    @Post('/new_password')
    async newPassword(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: newPasswordDTOCustomer
    ) {
        const result = await this.authService.newPassword(lang, req);
        return result;
    }

    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Get('/get_info_by_token')
    async getInfoByToken(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user
    ) {
        try {
            const payload = user;
            const convertPhone = await this.globalService.convertPhone(lang, user)
            payload.phone = convertPhone.phone;
            const result = await this.authService.getInfoByToken(lang, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Post('edit_infor')
    async customerEditItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Body() req: editInforDTOCustomer,
    ) {
        try {
            const payload = user;
            const convertPhone = await this.globalService.convertPhone(lang, user)
            payload.phone = convertPhone.phone;
            const result = await this.authService.customerEditItem(lang, req, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Get('/get_points')
    async getPoints(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user
    ) {
        try {
            const payload = user;
            // const convertPhone = await this.globalService.convertPhone(lang, user)
            // payload.phone = convertPhone.phone;
            const result = await this.authService.getPoints(lang, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Get('/get_rank_points')
    async getRankPoints(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user
    ) {
        try {
            const payload = user;
            const result = await this.authService.getRankPoints(lang, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Get('/get_cash')
    async getCash(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user
    ) {
        try {
            // const payload = user;
            // const convertPhone = await this.globalService.convertPhone(lang, user)
            // payload.phone = convertPhone.phone;
            const result = await this.authService.getCash(lang, user);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('customer')
    @Post('/save_token_device/:token')
    async saveTokenDevice(
        @Param('token') token: string,
    ) {
        console.log('ssss')
        try {
            const result = await this.authService.saveTokenDevice(token);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
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

    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Post('/change_password')
    async changePassword(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetUserByToken() user,
        @Body() req: changePasswordDTOCustomer,
    ) {
        try {
            const result = await this.authService.changePassword(lang, user, req);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);

        }
    }

    @Get('/get_max')
    async getMax(

    ) {
        try {
            const result = await this.authService.getMax();
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);

        }
    }
}
