<<<<<<< HEAD
import { Body, Controller, Get, HttpException, HttpStatus, Post, Query, UseGuards } from '@nestjs/common'
=======
import { CacheInterceptor } from '@nestjs/cache-manager'
import { Body, Controller, Get, HttpException, HttpStatus, Post, Query, Req, UseGuards, UseInterceptors } from '@nestjs/common'
>>>>>>> son
import { AuthGuard } from '@nestjs/passport'
import { ApiTags } from '@nestjs/swagger'
import { DEFAULT_LANG, GetSubjectAction, LANGUAGE, ValidateLangPipe } from 'src/@core'
import { CustomerSystemService } from 'src/core-system/@core-system/customer-system/customer-system.service'
import { DeviceTokenSystemService } from 'src/core-system/@core-system/device-token-system/device-token-system.service'
import { SettingSystemService } from 'src/core-system/@core-system/setting-system/setting-system.service'

@Controller('setting')
// @UseInterceptors(CacheInterceptor)
export class SettingApiController {
    constructor(
        private settingSystemService: SettingSystemService,
        private deviceTokenSystemService: DeviceTokenSystemService,
        private customerSystemService: CustomerSystemService,
    ) { }


    @ApiTags('customer')
    @Get('')
    async settings(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Req() req: any,
    ) {
        try {
            const result = await this.settingSystemService.getCustomerSetting(lang, req);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Get('check_expiration_time')
    async checkExpirationTimeHasExpired(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetSubjectAction() subjectAction,
    ) {
        try {
            const result = await this.deviceTokenSystemService.checkExpirationTimeHasExpired(lang, subjectAction)
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Post('update_device_token')
    async updateDeviceToken(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetSubjectAction() subjectAction,
        @Body() req: { device_token: string },
    ) {
        try {
            const result = await this.deviceTokenSystemService.updateDeviceToken(subjectAction, req)
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiTags('customer')
    @UseGuards(AuthGuard('jwt_customer'))
    @Get('get_payment_information')
    async getPaymentInformation(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetSubjectAction() subjectAction,
    ) {
        try {
            const result = await this.customerSystemService.getPaymentInformationByCustomer(lang, subjectAction._id)
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

