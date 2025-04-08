import { Controller, Get, HttpException, HttpStatus, Post, Query, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiTags } from '@nestjs/swagger'
import { DEFAULT_LANG, GetSubjectAction, LANGUAGE, ValidateLangPipe } from 'src/@core'
import { iPageNotificationDTO } from 'src/@core/dto/notification.dto'
import { NotificationSystemService } from 'src/core-system/@core-system/notification-system/notification-system.service'
// import { CONFIG_API } from '../collaborator-api.module';
export const CONFIG_API = {
    jwt_token: "jwt_collaborator",
    api_tag: "collaborator"
  }
  

@Controller('notification')
export class NotificationApiController {
    constructor(
        private notificationSystemService: NotificationSystemService,
    ){}
    
    @UseGuards(AuthGuard(CONFIG_API.jwt_token))
    @ApiTags(CONFIG_API.api_tag)
    @Get('/get_notification')
    async getNotification(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageNotificationDTO,
        @GetSubjectAction() subjectAction
    ): Promise<any> {
        try {
            iPage.length = Number(iPage.length) || 10;
            iPage.search = iPage.search || '';
            iPage.start = Number(iPage.start) || 0;
            iPage.type_notification = iPage.type_notification || "promotion";
            const result = await this.notificationSystemService.getList(lang, subjectAction, iPage);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @UseGuards(AuthGuard(CONFIG_API.jwt_token))
    @ApiTags(CONFIG_API.api_tag)
    @Post('/create_item_test_noti')
    async createItemTestNoti(
    ): Promise<any> {
        try {
            const result = await this.notificationSystemService.createItemTestNoti();
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
}
