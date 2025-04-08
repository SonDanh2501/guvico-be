import { Body, Controller, Get, Headers, HttpException, HttpStatus, Post, Query, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiTags } from '@nestjs/swagger'
import { DEFAULT_LANG, GetSubjectAction, LANGUAGE, ValidateLangPipe } from 'src/@core'
import { DeviceTokenSystemService } from 'src/core-system/@core-system/device-token-system/device-token-system.service'
import { SettingSystemService } from 'src/core-system/@core-system/setting-system/setting-system.service'

@Controller('setting')
export class SettingApiController {
    constructor(

        private deviceTokenSystemService: DeviceTokenSystemService,
        private settingSystemService: SettingSystemService
    ) { }



    @ApiTags('collaborator')
    @Get('')
    async settings(
        @Req() req: any,
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    ) {
        try {
            const result = await this.settingSystemService.getCollaboratorSetting(lang, req);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
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

    @ApiTags('collaborator')
    @UseGuards(AuthGuard('jwt_collaborator'))
    @Post('update_device_token')
    async updateDeviceToken(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @GetSubjectAction() subjectAction,
        @Body() req: any,
    ) {

        try {
            const result = await this.deviceTokenSystemService.updateDeviceToken(subjectAction, req)
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
