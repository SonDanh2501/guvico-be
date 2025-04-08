import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ServiceAccount } from 'firebase-admin';
import { PushNotificationDTO } from './pushnotification.dto';
import * as serviceAccount from './guvi.json';
import { DeviceToken, DeviceTokenDocument } from 'src/@core/db/schema/device_tokens.schema';


@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(DeviceToken.name) private deviceTokenModel: Model<DeviceTokenDocument>,

  ) {
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

    if(pushNotificationDTO.soundGuvi && pushNotificationDTO.soundGuvi === true) {
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


}
