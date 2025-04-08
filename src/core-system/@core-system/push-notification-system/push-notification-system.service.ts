import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { Types } from 'mongoose'
import { LIMIT_DEVICE_TOKENS } from 'src/@core/constant'
import { NOTIFICATION_SOUND } from 'src/@repositories/module/mongodb/@database/enum/notification.enum'
import { PushNotificationService } from 'src/@share-module/push-notification/push-notification.service'
import { DeviceTokenOopSystemService } from 'src/core-system/@oop-system/device-token-oop-system/device-token-oop-system.service'
import { NotificationOopSystemService } from 'src/core-system/@oop-system/notification-oop-system/notification-oop-system.service'
import { AdminGateway } from 'src/rest/websocket/admin-websocket/admin.gateway'
import { CollaboratorGateway } from 'src/rest/websocket/collaborator-websocket/collaborator.gateway'
import { CustomerGateway } from 'src/rest/websocket/customer-websocket/customer.gateway'
import { TYPE_SERVER_GATEWAY } from './../../../@repositories/module/mongodb/@database/enum/base.enum'

@Injectable()
export class PushNotificationSystemService {
    constructor( 
        private collaboratorGateway: CollaboratorGateway,
        private customerGateway: CustomerGateway,
        private adminGateway: AdminGateway,

        private notificationOopSystemService: NotificationOopSystemService,
        private deviceTokenOopSystemService: DeviceTokenOopSystemService,

        private pushNotificationService: PushNotificationService
    ) {}

    private isFunctionRunning: boolean = false
    private readonly MAX_MESSAGES_PER_SECOND = 300; // Gioi han so luong thong bao trong 1 giay
    totalMessageCount = 0; // Tong so thong bao gui di trong moi giay
    // Hang doi de luu thong bao khi vuot qua gioi han
    private messageQueue: { lang:any, serverGateway:any, session_socket:string, eventName:string, notification: any }[] = [];
    
    private serverGatewayMap = new Map<any, any>([ 
        ['customer', this.customerGateway],
        ['collaborator', this.collaboratorGateway],
        ['admin', this.adminGateway],
    ])

    // Xu ly cac thong bao trong hang doi
    async processMessageQueue() {
        // Duyet qua hang doi va gui thong bao neu chua vuoi qua gioi han
        while (this.messageQueue.length > 0 && this.totalMessageCount < this.MAX_MESSAGES_PER_SECOND) {
            // Lay thong bao trong hang doi
            const { lang, serverGateway, session_socket, eventName, notification } = this.messageQueue.shift(); 
            if (session_socket) {
                let channelId = NOTIFICATION_SOUND.default as any
                if (notification.sound_guvi !== NOTIFICATION_SOUND.default) {
                    channelId = 'sound'
                }
                const androidConfig = {
                    priority: 'high',
                    notification: {
                        sound: notification.sound_guvi,
                        channelId: channelId
                    }
                }

                const iosConfig = {
                    payload: {
                        aps: {
                            contentAvailable: true,
                            sound: `${notification.sound_guvi}.wav`
                        }
                    }
                }

                serverGateway.server.to(session_socket).emit(eventName, { notification, lang, android: androidConfig, apns: iosConfig });
            }
            await this.notificationOopSystemService.updatePushTime(lang, notification._id)
            this.totalMessageCount++;
        }
    }

    private async pushMessageIntoMessageQueue(lang, serverGatewayType, session_socket, eventName, notification, ) {        
        const serverGateway = this.serverGatewayMap.get(serverGatewayType)
        
        // Neu tong so thong bao da gui trong giay hien tai nho hon gioi han thi gui tiep
        // if (this.totalMessageCount < this.MAX_MESSAGES_PER_SECOND) {
            if (session_socket === null || session_socket === undefined || !session_socket) {                
                await this.notificationOopSystemService.updateFailStatusUsingSocket(lang, notification._id)
            } else {
                let channelId = NOTIFICATION_SOUND.default as any
                if (notification.sound_guvi !== NOTIFICATION_SOUND.default) {
                    channelId = 'sound'
                }
                const androidConfig = {
                    priority: 'high',
                    notification: {
                        sound: notification.sound_guvi,
                        channelId: channelId
                    }
                }

                const iosConfig = {
                    payload: {
                        aps: {
                            contentAvailable: true,
                            sound: `${notification.sound_guvi}.wav`
                        }
                    }
                }
                
                if (serverGateway?.server) {
                    serverGateway.server.to(session_socket).emit(eventName, { notification, lang, android: androidConfig, apns: iosConfig });
                }
                await this.notificationOopSystemService.updatePushTime(lang, notification._id)
            }
        //     this.totalMessageCount++; 
        // } else {
        //     // Neu vuot qua gioi han thi dua vao hang doi
        //     this.messageQueue.push({lang, serverGateway, session_socket, eventName, notification});
        // }
    }

    async pushNotification(lang, notification) {

        // Thong bao duoc ban theo websocket
        if (notification && !notification.push_time && !notification.is_respond && !notification.is_success) {

        }

        // Thong bao duoc ban theo firebase
        if (notification && notification.push_time && !notification.is_respond) {

        }

        return true
    }

    /* Xu ly theo Websocket */    

    async sendNotificationUsingSocket(lang, serverGatewayType, sessionSocket, notification) {
        this.pushMessageIntoMessageQueue(lang, serverGatewayType, sessionSocket, 'sendNotificationToClient' , notification)
        return true
    }

    async sendMarketingNotificationUsingSocket(lang, serverGatewayType, sessionSocket, notification) {
        this.pushMessageIntoMessageQueue(lang, serverGatewayType, sessionSocket, 'sendMarketingNotificationToClient', notification)
        return true
    }

    async sendAndUpdateNotificationUsingSocket(lstUser, notifcationMap, type_server_gateway) {
        try {
            for(const user of lstUser) {
                let notification = notifcationMap.get(user._id.toString())
                if(notification) {
                    this.sendMarketingNotificationUsingSocket('vi', TYPE_SERVER_GATEWAY[type_server_gateway], user.session_socket, notification)
                }
            }

            return true
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
    }

    /* Xu ly theo Firebase */    

    async sendNotificationUsingFirebase() {
        if (this.isFunctionRunning) {
            return // Hàm đang thực thi, từ chối thực hiện
        }
        try {
            this.isFunctionRunning = true
            const result = await this.notificationOopSystemService.getListForPushNotificationForFirebase()

            if (result?.data.length > 0) {
                // 2. Tao danh sach chua id_customer va id_collaborator neu id_customer khong co
                let lstId = result.data.map((s:any) => s?.id_customer ? s.id_customer.toString() : s.id_collaborator.toString())

                // 3. Lay danh sach deviceToken theo danh sach id
                let lstDeviceToken = await this.deviceTokenOopSystemService.getList(lstId)
                
                // 4. Map danh sach deviceToken lay user_id lam key
                const mapDeviceToken = new Map<string, any>(lstDeviceToken.map((deviceToken) => [deviceToken.user_id.toString(), deviceToken]))

                // 5. Cap nhat thong bao khong co device token
                await this.updateNotificationNoDeviceTokenAvailable(result.data, mapDeviceToken, lstDeviceToken)
                
                if (lstDeviceToken.length > 0) {
                    // 6. Cau hinh message
                    let lstMessage = await this.configMessageForFirebase(result.data, mapDeviceToken)

                    // 7. Chia danh sach tin nhan ra ban
                    await this.sendAndUpdateNotificationUsingFirebase(lstMessage) 
                }
            }

            return true
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        } finally {
            this.isFunctionRunning = false
        }
    }

    private async configMessageForFirebase(lstNotification, mapDeviceToken) {
        try {

            let lstMessage = []
    
            for (let i = 0; i < lstNotification.length; i++) {
                const user_id = lstNotification[i]?.id_customer ? lstNotification[i].id_customer.toString() : lstNotification[i].id_collaborator.toString()
                const deviceToken = mapDeviceToken.get(user_id)
                if (deviceToken) {
                    const payloadMessage = {
                        token: deviceToken.token, 
                        title: lstNotification[i].title.vi, 
                        body: lstNotification[i].body.vi, 
                        imageUrl: lstNotification[i].image_url, 
                        data: { 
                            id_notification: lstNotification[i]._id.toString(),
                            user_id: deviceToken.user_id,
                            user_object: deviceToken.user_object,
                            id_device_token: deviceToken._id.toString(),
                        }, 
                        soundGuvi: typeof lstNotification[i]?.sound_guvi === 'string' ? lstNotification[i].sound_guvi : NOTIFICATION_SOUND.default
                    }
                    let message = this.                                                                 
                    pushNotificationService.configMessage(payloadMessage)
                    
                    lstMessage.push(message)
                }
            }
    
            return lstMessage
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private async sendAndUpdateNotificationUsingFirebase(lstMessage) {   
        try {
            for (let i = 0; i < lstMessage.length; i += LIMIT_DEVICE_TOKENS) {
                let newLstMessage = lstMessage.slice(i, i + LIMIT_DEVICE_TOKENS)
                
                let lstIdFailNoti = []
                let lstIdFailDevice = []
                let lstIdDoneNoti = []
                const result = await this.pushNotificationService.sendEach(newLstMessage)            

                console.log('successCount: ' + result.successCount);
                console.log('failureCount: ' + result.failureCount);

                for (let j = 0; j < newLstMessage.length; j++) {
                    if (result.responses[j].success) {
                        lstIdDoneNoti.push(newLstMessage[j].data.id_notification)
                    }

                    if(!result.responses[j].success) {
                        lstIdFailNoti.push(newLstMessage[j].data.id_notification)
                        if(result.responses[j].error.code == 'messaging/registration-token-not-registered') {
                            lstIdFailDevice.push(new Types.ObjectId(newLstMessage[j].data.id_device_token))
                        }
                        console.log(`Using Firebase Fail: user_id: ${newLstMessage[j].data.user_id} - user_object: ${newLstMessage[j].data.user_object} - FCM token: ${newLstMessage[j].token} - errorCode: ${result.responses[j].error.code} - errorMessage: ${result.responses[j].error.message}`);
                    }
                }

                if (lstIdDoneNoti.length > 0) {
                    await this.notificationOopSystemService.updateFirebaseDoneManyNoti(lstIdDoneNoti)
                }
                if (lstIdFailNoti.length > 0) {
                    await this.notificationOopSystemService.updateFirebaseFailManyNoti(lstIdFailNoti)
                }
                if (lstIdFailDevice.length > 0) {
                    await this.deviceTokenOopSystemService.deleteSoftDeviceToken(lstIdFailDevice)
                }
            }   

            return true 
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateNotificationNoDeviceTokenAvailable(lstNotification, mapDeviceToken, lstDeviceToken) {
        try {
            if (lstDeviceToken.length === 0) {
                let lstIdNotifications = lstNotification.map((s:any) => s._id)
                await this.notificationOopSystemService.updateFirebaseFailManyNoti(lstIdNotifications)
            } else {
                const lstId = []
                for (let i = 0; i < lstNotification.length; i++) {
                    // Lay user_id
                    const user_id = lstNotification[i]?.id_customer ? lstNotification[i].id_customer.toString() : lstNotification[i].id_collaborator.toString()
                    // Tim device token
                    const getDeviceToken = mapDeviceToken.get(user_id)
                    // Neu khong co device token thi day id notification cua mang id
                    if (!getDeviceToken) {
                        lstId.push(lstNotification[i]._id)
                    }
                }
                if (lstId.length > 0) {
                    await this.notificationOopSystemService.updateFirebaseFailManyNoti(lstId)
                }
            }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
