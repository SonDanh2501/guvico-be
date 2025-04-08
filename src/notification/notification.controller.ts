import { Body, Controller, HttpException, HttpStatus, Post, Query } from '@nestjs/common';
import { DEFAULT_LANG, GlobalService, LANGUAGE, ValidateLangPipe, } from 'src/@core';
import { NotificationService } from './notification.service';
import { PushNotificationDTO } from './pushnotification.dto';
import * as admin from 'firebase-admin';
import { getDatabase } from 'firebase/database';
import { set } from 'mongoose';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
// import * from './main.js' 
@Controller('notification')
export class NotificationController {
    constructor(
        private notificationService: NotificationService
    ) { }


    // @ApiTags('customer')
    // @Post('push_noti')
    // async send(
    //     @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
    //     @Body() payload: PushNotificationDTO,
    // ) {
    //     try {
    //         return await this.notificationService.send(payload);
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }



    @Post('push_noti')
    async send(
        @Query('lang', ValidateLangPipe) lang: LANGUAGE = DEFAULT_LANG,
        @Body() payload: PushNotificationDTO,
        // @Body() token,
    ) {
        try {

            // const { token, title, body, imageUrl } = payload

            // try {
            //     const { uid } = await admin.auth().createUser({
            //         uid: 'some-uid',
            //         email: 'user@example.com',
            //         phoneNumber: '+11234567890',

            //     });
            //     await admin.auth().setCustomUserClaims(uid, { token });
            // return { uid };
            // const token = "d8GeGRVRTbmsvcUGYLuklj:APA91bE92Qt6p0S3vp5CbZk5qyGW4r4ZHdqXufnlbQT-oRWOvXhAz1UCaZMRapeobDfrow_2wUX7yoGG8H5iJaOc97EYbG0KXC8349iI_k1jr4h0TbK6qe2wsEDt93vXCAqrmS_ut9GA";
            return await this.notificationService.send(payload);
            // writeTokenData(payload.token);
            // return payload

        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    catch(err) {
        throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    }
}

