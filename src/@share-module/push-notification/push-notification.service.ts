import { Injectable } from '@nestjs/common'
import * as admin from 'firebase-admin'
import { ServiceAccount } from 'firebase-admin'
import { NOTIFICATION_SOUND } from 'src/@repositories/module/mongodb/@database/enum/notification.enum'
import * as serviceAccount from './guvi.json'


export class dataDTO {
    public readonly link?: string
}

export class PushNotificationDTO {
    public readonly token: string[];
    public readonly title: string;
    public readonly body: string;
    public readonly imageUrl?: string;
    public readonly data?: dataDTO;
    public readonly image_url?: string;
    public readonly soundGuvi?: boolean;
}

@Injectable()
export class PushNotificationService {
    constructor() {
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount as ServiceAccount),
                databaseURL: "https://console.firebase.google.com/u/1/project/guvico-351910/overview",
            })
        }
    }

    send(pushNotificationDTO: PushNotificationDTO) {

        let { token, title, body, data } = pushNotificationDTO
        const imageUrl = pushNotificationDTO.imageUrl || pushNotificationDTO.imageUrl || null
        console.log(title, 'title')
        console.log(token.length, 'token.length')
        if (token.length > 400) token = token.slice(0, 400);
        // console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<",typeof(data)) 
        // console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<   data.link",typeof(data.link)) 


        let androidConfig: admin.messaging.AndroidConfig;

        if (pushNotificationDTO.soundGuvi && pushNotificationDTO.soundGuvi === true) {
            androidConfig = {
                priority: 'high',
                notification: {
                    sound: "soundguvi.mp3",
                    channelId: "sound"
                }
            };
        } else {
            androidConfig = {
                priority: 'high'
            };
        }
        const iosConfig: admin.messaging.ApnsConfig = {
            payload: {
                aps: {
                    contentAvailable: true,
                    sound: "soundguvi.wav"
                }
            }
        }

        const message = {
            notification: {
                title: title,
                body: body,
            },
            data: {
            },
            android: androidConfig,
            apns: iosConfig,
            tokens: token,
        }
        if (imageUrl && imageUrl !== null && imageUrl !== "") {
            message.notification["imageUrl"] = imageUrl;
        }
        if (data && data !== null && Object.keys(data).length !== 0) {
            message.data["link"] = data.link;
        }

        admin.messaging().sendEachForMulticast(message)
        // Promise.all([await admin.messaging().sendEachForMulticast(message)])

        // Promise.all([await admin.messaging().sendMulticast(message)])


        return message;
    }

    configMessage(notification) {
        const { token, title, body, imageUrl, data, soundGuvi } = notification

        let channelId = NOTIFICATION_SOUND.default as any
        if (soundGuvi !== NOTIFICATION_SOUND.default) {
            channelId = 'sound'
        }

        let androidConfig: admin.messaging.AndroidConfig = {
            priority: 'high',
            notification: {
                sound: soundGuvi,
                channelId: channelId
            }
        };

        let iosConfig: admin.messaging.ApnsConfig = {
            payload: {
                aps: {
                    contentAvailable: true,
                    sound: `${soundGuvi}.wav`
                }
            },
            fcmOptions: {}
        }

        if (imageUrl) {
            androidConfig.notification['imageUrl'] = imageUrl
            iosConfig.fcmOptions['imageUrl'] = imageUrl
        }

        const message = {
            notification: {
                title: title,
                body: body,
            },
            data: {
                id_notification: data.id_notification,
                user_id: data.user_id,
                user_object: data.user_object,
                id_device_token: data.id_device_token
            },
            android: androidConfig,
            apns: iosConfig,
            token: token,
        }
        if (imageUrl && imageUrl !== null && imageUrl !== "") {
            message.notification["imageUrl"] = imageUrl;
        }
        if (data?.link && Object.keys(data).length !== 0) {
            message.data["link"] = data.link;
        }

        return message;
    }

    async sendEach(lstMessage) {
        return await admin.messaging().sendEach(lstMessage) 
    }
}
