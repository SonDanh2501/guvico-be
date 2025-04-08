import { Controller, Get, HttpException, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiTags } from '@nestjs/swagger'
import { DEFAULT_LANG, GetSubjectAction, GetUserByToken, LANGUAGE, ValidateLangPipe } from 'src/@core'
import { iPageNotificationDTO } from 'src/@core/dto/notification.dto'
import { NotificationSystemService } from 'src/core-system/@core-system/notification-system/notification-system.service'
import { NotificationService } from './notification.service'

@Controller('notification')
export class NotificationController {
    constructor(
        private notificationService: NotificationService,
        private notificationSystemService: NotificationSystemService,

    ) { }

    @UseGuards(AuthGuard('jwt_customer'))
    @ApiTags('customer')
    @Get('/get_notification')
    async getNotification(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageNotificationDTO,
        @GetSubjectAction() subjectAction
    ) {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.search = iPage.search || '';
            iPage.start = Number(iPage.start) || 0;
            iPage.type_notification = iPage.type_notification || "promotion";
            const result = await this.notificationSystemService.getList(lang, subjectAction, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    @UseGuards(AuthGuard('jwt_customer'))
    @ApiTags('customer')
    @Post('/set_readed/:idNotification')
    async setReaded(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Param("idNotification") idNotification: string,
        @GetUserByToken() user
    ) {
        try {
            const result = await this.notificationService.setReaded(lang, idNotification, user._id);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }

    }

    @UseGuards(AuthGuard('jwt_customer'))
    @ApiTags('customer')
    @Post('/set_all_readed')
    async setAllReaded(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query("type_notification") type_notification: string,
        @GetUserByToken() user
    ) {
        try {
            const typeNotification = type_notification || "activity";
            const result = await this.notificationService.setAllReaded(lang, typeNotification, user._id);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

}
