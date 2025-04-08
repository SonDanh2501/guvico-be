import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { DEFAULT_LANG, GetUserByToken, iPageDTO, LANGUAGE, ValidateLangPipe } from 'src/@core';
import { activePushNotificationDTOAdmin, createPushNotificationDTOAdmin, deletePushNotificationDTOAdmin, editPushNotificationDTOAdmin, iPagePushNotificationDTOAdmin } from 'src/@core/dto/push_notification.dto';
import { PushNotificationManagerService } from './push-notification-manager.service';

@Controller('push_notification_manager')
export class PushNotificationManagerController {
    constructor(private pushNotificationManagerService: PushNotificationManagerService) { }

    @ApiTags('admin')
    @Get('get_list')
    @UseGuards(AuthGuard('jwt'))
    async getListItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPagePushNotificationDTOAdmin,
    ) {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.search = decodeURI(iPage.search || "");
            iPage.start = Number(iPage.start) || 0;
            iPage.status = (iPage.status) ? iPage.status : "all";
            const result = await this.pushNotificationManagerService.getListItem(lang, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);

        }

    }

    @ApiTags('admin')
    @Get('detail_item/:id')
    @UseGuards(AuthGuard('jwt'))
    async getDetailItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param("id") id: string
    ) {
        const result = await this.pushNotificationManagerService.getDetailItem(lang, id);
        return result;
    }

    @ApiTags('admin')
    @Post('/create_item')
    @UseGuards(AuthGuard('jwt_admin'))
    async createItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: createPushNotificationDTOAdmin,
        @GetUserByToken() user,
    ) {
        try {
            const result = await this.pushNotificationManagerService.createItem(lang, req, user._id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Post('edit_item/:id')
    @UseGuards(AuthGuard('jwt_admin'))
    async editItem(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
        @Body() req: editPushNotificationDTOAdmin,
        @GetUserByToken() user,
    ) {
        try {
            const result = await this.pushNotificationManagerService.editItem(lang, req, id, user._id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }

    }

    @ApiTags('admin')
    @Post('active_item/:id')
    @UseGuards(AuthGuard('jwt_admin'))
    async activeCustomer(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
        @Body() req: activePushNotificationDTOAdmin,
        @GetUserByToken() user,
    ) {
        const result = await this.pushNotificationManagerService.activeNoti(lang, req, id, user._id);
        return result;
    }

    @ApiTags('admin')
    @Post('delete_item/:id')
    @UseGuards(AuthGuard('jwt_admin'))
    async deleteCustomer(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param('id') id: string,
        @GetUserByToken() user,
    ) {
        const result = await this.pushNotificationManagerService.deletePushNoti(lang, id, user._id);
        return result;
    }


    @ApiTags('admin')
    @Get('/test_send_now')
    // @UseGuards(AuthGuard('jwt_admin'))
    async testSendNow(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: any
    ) {
        try {
            const result = await this.pushNotificationManagerService.testSendNow(lang, req);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @ApiTags('admin')
    @Post('/send_to_device_token')
    async testPush(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() req: any,
    ) {
        try {
            const result = await this.pushNotificationManagerService.pushToDevice(req);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
