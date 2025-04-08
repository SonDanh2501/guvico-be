import { HttpException, HttpStatus, Injectable, Body } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DeviceToken, DeviceTokenDocument, GlobalService } from 'src/@core';
import { pushNotiDTO, pushNotiMultipleUserDTO } from 'src/@core/dto/push_notification.dto';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service';
import { NotificationService } from 'src/notification/notification.service';
import { skip } from 'rxjs';
import { NotificationSystemService } from '../notification-system/notification-system.service';
import { GroupOrderDocument } from 'src/@repositories/module/mongodb/@database';

@Injectable()
export class PushNotiSystemService {
    constructor(
        private generalHandleService: GeneralHandleService,
        private globalService: GlobalService,
        private notificationService: NotificationService,
        private customExceptionService: CustomExceptionService,
        private notificationSystemService: NotificationSystemService,

        @InjectModel(DeviceToken.name) private deviceTokenModel: Model<DeviceTokenDocument>,
    ) { }

    async pushNotiCollaboratorFavorite(getGroupOrder: GroupOrderDocument) {// tạm thời ngưng sử dụng
        try {
            const arrId = [];
            for (let id of getGroupOrder.id_favourite_collaborator) { // Bắn push noti cho CTV được yêu thích trong group order
                arrId.push(id.toString());
            }
            const query = {
                $and: [
                    {
                        user_object: 'collaborator'
                    },
                    {
                        user_id: { $in: arrId }
                    }
                ]
            }
            let iPage = {
                start: 0,
                length: 350
            }
            const count = await this.deviceTokenModel.count(query)
            do {
                const arrDeviceTokenColl = await this.deviceTokenModel.aggregate([
                    { $match: query },
                    { $sort: { _id: -1, date_create: 1 } },
                    { $skip: Number(iPage.start) },
                    { $limit: Number(iPage.length) }
                ]);
                if (arrDeviceTokenColl.length > 0) {
                    const payload = {
                        title: "🔥 Có công việc mới !!!",
                        body: "🤩 Có công việc mới hấp dẫn gần bạn \n👉 Nhấn để xem ngay nhé",
                        data: { link: "guvipartner://" },
                        token: [arrDeviceTokenColl[0].token]
                    }
                    for (let i = 1; i < arrDeviceTokenColl.length; i++) {
                        payload.token.push(arrDeviceTokenColl[i].token)
                    }
                    this.notificationService.send(payload)
                }
                iPage.start += 350;
            } while (iPage.start < count)
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);

        }
    }

    async pushNotiCollaborator(getGroupOrder: GroupOrderDocument) { // Bắn push noti cho các CTV khác yêu thích và hạn chế
        const arrId = [];
        for (let id of getGroupOrder.id_block_collaborator) {
            arrId.push(id.toString());
        }
        for (let id of getGroupOrder.id_favourite_collaborator) {
            arrId.push(id.toString());
        }
        try {
            const query = {
                $and: [
                    {
                        user_object: 'collaborator'
                    },
                    {
                        user_id: { $nin: arrId }
                    }
                ]
            }
            let iPage = {
                start: 0,
                length: 350
            }
            const count = await this.deviceTokenModel.count(query)
            do {
                const arrDeviceTokenColl = await this.deviceTokenModel.aggregate([
                    { $match: query },
                    { $sort: { _id: -1, date_create: 1 } },
                    { $skip: Number(iPage.start) },
                    { $limit: Number(iPage.length) }
                ]);
                if (arrDeviceTokenColl.length > 0) {
                    const payload = {
                        title: "🔥 Có công việc mới !!!",
                        body: "🤩 Có công việc mới hấp dẫn gần bạn \n👉 Nhấn để xem ngay nhé",
                        data: { link: "guvipartner://" },
                        token: [arrDeviceTokenColl[0].token]
                    }
                    for (let i = 1; i < arrDeviceTokenColl.length; i++) {
                        payload.token.push(arrDeviceTokenColl[i].token)
                    }
                    this.notificationService.send(payload)
                }
                iPage.start += 350;
            } while (iPage.start < count)

        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    } // tạm thời ngưng sử dụng

    async pushNoti(payload: pushNotiDTO) { // bắn push noti cho 1 User bất kì. Được định nghĩa các loại thông tin
        try {
            const arrDeviceToken = await this.deviceTokenModel.find({ user_id: payload.user_id })
            if (arrDeviceToken.length > 0) {
                const temp = {
                    title: payload.title,
                    body: payload.body,
                    token: [arrDeviceToken[0].token],
                    data: { link: payload.data }
                }
                for (let i = 1; i < arrDeviceToken.length; i++) {
                    temp.token.push(arrDeviceToken[i].token)
                }
                this.notificationService.send(temp)
            }
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async pushNotiMultipleUser(payload: pushNotiMultipleUserDTO) { // bắn push noti cho nhiều User. Được định nghĩa các loại thông tin
        try {
            const query = {
                $and: [
                    { user_id: { $in: payload.user_id } }
                ]
            }
            const iPage = {
                start: 0,
                length: 350
            }
            const count = await this.deviceTokenModel.count(query);
            do {
                const arrDeviceToken = await this.deviceTokenModel.find(query)
                    .sort({ _id: 1 })
                    .skip(iPage.start)
                    .limit(iPage.length)
                if (arrDeviceToken.length > 0) {
                    const temp = {
                        title: payload.title,
                        body: payload.body,
                        token: [arrDeviceToken[0].token],
                        data: { link: payload.data },
                        soundGuvi: (payload.user_object === "collaborator") ? true : false
                    }
                    for (let i = 1; i < arrDeviceToken.length; i++) {
                        temp.token.push(arrDeviceToken[i].token)
                    }
                    this.notificationService.send(temp)
                }
                iPage.start += 350;
            } while (iPage.start < count)
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async pushNotiCreateTopUpCollaborator(transaction) {
        const formatMoneyTranfer = await this.generalHandleService.formatMoney(transaction.money);
        const title = {
            vi: `Tạo thành công lệnh nạp ${transaction.transfer_note}`,
            en: `Create top up ${transaction.transfer_note} successfully`
        }
        const titleNoti = {
            vi: `Tạo thành công lệnh nạp`,
            en: `Create top up success`
        }
        const payloadNotification = {
            title: titleNoti,
            description: title,
            user_object: "collaborator",
            id_collaborator: transaction.id_collaborator,
            type_notification: "activity",
            value: transaction.money,
            id_transaction: transaction._id
        }
        this.notificationSystemService.newActivity(payloadNotification);

        const arrDeviceToken = await this.deviceTokenModel.find({ user_id: transaction.id_collaborator, user_object: "collaborator" })
        if (arrDeviceToken.length > 0) {
            const payload = {
                title: "Bạn đã tạo thành công lệnh nạp tiền!",
                body: `Bạn đã tạo thành công lệnh nạp ${formatMoneyTranfer}!!!`,
                token: [arrDeviceToken[0].token],
                data: { link: "guvipartner://Wallet" }
            }
            for (let i = 1; i < arrDeviceToken.length; i++) {
                payload.token.push(arrDeviceToken[i].token)
            }
            this.notificationService.send(payload)
        }
    }

    async pushNotiCreateWithdrawCollaborator(transaction) {
        const formatMoneyTranfer = await this.generalHandleService.formatMoney(transaction.money);

        const title = {
            vi: `Tạo thành công lệnh rút`,
            en: `Create withdraw successfully`
        }

        const payloadNotification = {
            title: title,
            description: title,
            user_object: "collaborator",
            id_collaborator: transaction.id_collaborator,
            type_notification: "activity",
            id_transaction: transaction._id
        }
        this.notificationSystemService.newActivity(payloadNotification);
        const arrDeviceToken = await this.deviceTokenModel.find({ user_id: transaction._id, user_object: "collaborator" })
        if (arrDeviceToken.length > 0) {
            const payload = {
                title: "Bạn đã tạo thành công lệnh rút tiền",
                body: `Bạn đã tạo thành công lệnh rút ${formatMoneyTranfer}`,
                token: [arrDeviceToken[0].token],
                data: { link: "guvipartner://Wallet" }
            }
            for (let i = 1; i < arrDeviceToken.length; i++) {
                payload.token.push(arrDeviceToken[i].token)
            }
            this.notificationService.send(payload)
        }
    }

    async pushNotiHoldingMoneyCollaborator(transaction) {
        const formatMoneyTranfer = await this.generalHandleService.formatMoney(transaction.money);
        const title = {
            vi: `Hệ thống tạm giữ tiền của bạn`,
            en: `The system temporarily holds your money`
        }
        const description = {
            vi: `Hệ thống tạm giữ ${formatMoneyTranfer} của bạn từ lệnh rút tiền ${transaction.id_view}`,
            en: `The system temporarily holds ${formatMoneyTranfer} your money from transaction withdraw ${transaction.id_view}`
        }
        const payloadNotification = {
            title: title,
            description: description,
            user_object: "collaborator",
            id_collaborator: transaction.id_collaborator,
            type_notification: "activity",
            id_transaction: transaction._id
        }
        this.notificationSystemService.newActivity(payloadNotification);
        const arrDeviceToken = await this.deviceTokenModel.find({ user_id: transaction._id, user_object: "collaborator" })
        if (arrDeviceToken.length > 0) {
            const payload = {
                title: "Hệ thống tạm giữ tiền của bạn",
                body: `Hệ thống tạm giữ ${formatMoneyTranfer} của bạn từ lệnh rút tiền ${transaction.id_view}`,
                token: [arrDeviceToken[0].token],
                data: { link: "guvipartner://Wallet" }
            }
            for (let i = 1; i < arrDeviceToken.length; i++) {
                payload.token.push(arrDeviceToken[i].token)
            }
            this.notificationService.send(payload)
        }
    }

    async pushNotiGiveBackMoneyCollaborator(transaction) {
        const formatMoneyTranfer = await this.generalHandleService.formatMoney(transaction.money);
        const title = {
            vi: `Hệ thống hoàn tiền cho bạn`,
            en: `The system temporarily holds your money`
        }
        const description = {
            vi: `Hệ thống hoàn ${formatMoneyTranfer} cho bạn từ lệnh rút tiền ${transaction.id_view}`,
            en: `The system give back ${formatMoneyTranfer} your money from transaction withdraw ${transaction.id_view}`
        }
        const payloadNotification = {
            title: title,
            description: description,
            user_object: "collaborator",
            id_collaborator: transaction.id_collaborator,
            type_notification: "activity",
            id_transaction: transaction._id
        }
        this.notificationSystemService.newActivity(payloadNotification);
        const arrDeviceToken = await this.deviceTokenModel.find({ user_id: transaction._id, user_object: "collaborator" })
        if (arrDeviceToken.length > 0) {
            const payload = {
                title: "Hệ thống hoàn tiền cho bạn",
                body: `Hệ thống hoàn ${formatMoneyTranfer} cho bạn từ lệnh rút tiền ${transaction.id_view}`,
                token: [arrDeviceToken[0].token],
                data: { link: "guvipartner://Wallet" }
            }
            for (let i = 1; i < arrDeviceToken.length; i++) {
                payload.token.push(arrDeviceToken[i].token)
            }
            this.notificationService.send(payload)
        }
    }
}
