import { Controller, Get, HttpException, HttpStatus, Query, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiTags } from '@nestjs/swagger'
import { DEFAULT_LANG, GetSubjectAction, LANGUAGE, ValidateLangPipe } from 'src/@core'
import { iPageNotificationDTOCustomer } from 'src/@core/dto/notification.dto'
import { NotificationSystemService } from 'src/core-system/@core-system/notification-system/notification-system.service'
// import { CONFIG_API } from '../customer-api.module';
export const CONFIG_API = {
    jwt_token: "jwt_customer",
    api_tag: "customer"
  }
  

@Controller('notification')
export class NotificationApiController {
    constructor(
        private notificationSystemService: NotificationSystemService
    ) { }

    @UseGuards(AuthGuard(CONFIG_API.jwt_token))
    @ApiTags(CONFIG_API.api_tag)
    @Get('/get_notification')
    async getNotification(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Query() iPage: iPageNotificationDTOCustomer,
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
}
