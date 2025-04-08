import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { ERROR } from 'src/@core'
import { iPageNotificationDTO } from 'src/@core/dto/notification.dto'
import { TYPE_USER_OBJECT } from 'src/@repositories/module/mongodb/@database/enum/base.enum'
import { NOTIFICATION_SOUND, STATUS_SEND_FIREBASE, STATUS_SEND_SOCKET, TYPE_NOTIFICATION } from 'src/@repositories/module/mongodb/@database/enum/notification.enum'
import { DeviceTokenRepositoryService } from 'src/@repositories/repository-service/device-token-repository/device-token-repository.service'
import { NotificationRepositoryService } from 'src/@repositories/repository-service/notification-repository/notification-repository.service'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service'
import { PushNotificationService } from 'src/@share-module/push-notification/push-notification.service'

export const LIMIT_ARR_ID_USER = 250

@Injectable()
export class NotificationOopSystemService {
    constructor(
        private customExceptionService: CustomExceptionService,
        private generalHandleService: GeneralHandleService,

        private notificationRepositoryService: NotificationRepositoryService,
        private deviceTokenRepositoryService: DeviceTokenRepositoryService,
        
        private pushNotificationService: PushNotificationService
    ) {}

    async getDetailItem(lang, idNotification) {
        try {
            const getNotification = await this.notificationRepositoryService.findOneById(idNotification);
            if(!getNotification) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "customer")], HttpStatus.NOT_FOUND)
            return getNotification;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async identifyUser(subject, user) {
        const payload = []
        if(subject === 'customer') {
            payload.push({user_object: "customer"})
            payload.push({id_customer: user._id})
        } else if(subject === 'collaborator') {
            payload.push({user_object: "collaborator"})
            payload.push({id_collaborator: user._id})
        }
        return payload;
    }

    async newIdentifyUser(subjectAction) {
        const payload = []
        if(subjectAction.type === 'customer') {
            payload.push({id_customer: subjectAction._id})
        } else if(subjectAction.type === 'collaborator') {
            payload.push({id_collaborator: subjectAction._id})
        }
        return payload;
    }

    async identifyUserReviceNoti(subjectSendNoti) {
        let payload = {
            user_object: subjectSendNoti.type,
            id_customer: null,
            id_collaborator:null
        }
        if(subjectSendNoti.type === 'customer') {
            payload.id_customer = subjectSendNoti._id
        } else if(subjectSendNoti.type === 'collaborator') {
            payload.id_collaborator = subjectSendNoti._id
        }
        return payload;
    }

    async newIdentifyUser(subjectAction) {
        const payload = []
        if(subjectAction.type === 'customer') {
            payload.push({id_customer: subjectAction._id})
        } else if(subjectAction.type === 'collaborator') {
            payload.push({id_collaborator: subjectAction._id})
        }
        return payload;
    }

    async splitArrIdUser(arrIdUser) {
        try {
            const resultData = []
            let start = 0
            do {
                resultData.push(arrIdUser.slice(start, start + LIMIT_ARR_ID_USER))
                start += LIMIT_ARR_ID_USER
            } while (arrIdUser[start + LIMIT_ARR_ID_USER] !== undefined)
            return resultData;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    async getList(lang, subjectAction, iPage: iPageNotificationDTO) {
        try {
            const sixMonthsAgo  = new Date(new Date(new Date().setMonth(new Date().getMonth() - 6)).setHours(0, 0, 0, 0)).toISOString()
            const query = {
                $and: [
                    { is_notification: true },
                    { user_object: subjectAction.type },
                    { type_notification: iPage.type_notification },
<<<<<<< HEAD
=======
                    { date_create: {$gte: sixMonthsAgo} },
>>>>>>> son
                    ...await this.newIdentifyUser(subjectAction),
                ]
            }
    
            const queryTotal = [    
                {
                    $match: {
                        $and: [
                            { is_notification: true },
                            { is_readed: false },
                            { user_object: subjectAction.type },
                            ...await this.newIdentifyUser(subjectAction),
                        ]
                    }
                },
                {
                    $group: {
                        _id: "",
                        all: {
                            $sum: 1
                        },
                        promotion: {
                            $sum: {$cond: [
                                {$eq: ["$type_notification", "promotion"]},1,0
                        ]
                            }
                        },
                        system: {
                            $sum: {$cond: [
                                    {$eq: ["$type_notification", "system"]},1,0
                                ]
                            }
                        },
                        activity: {
                        $sum: {$cond: [
                                    {$eq: ["$type_notification", "activity"]},1,0
                                ]
                            }
                        }
                    }
                }
            ]
    
    
            const resultQuery = await Promise.all([
                this.notificationRepositoryService.getListPaginationDataByCondition(iPage, query, {}, { date_create: -1, _id: 1 }),
                this.notificationRepositoryService.aggregateQuery(queryTotal)
            ])
    
            const result = {
                ...resultQuery[0],
                unRead: resultQuery[1]
                // unRead: {
                //     all: countUnReadAll,
                //     promotion: countUnReadPromotion,
                //     system: countUnReadSystem,
                //     activity: countUnReadActivity
                // },
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    async createItem(payload, notFirebase?) {
        try {
            const notification =
                await this.notificationRepositoryService.create({
                    title: payload.title,
                    body: payload.body,
                    description: payload.body,
                    id_customer: payload.id_customer || null,
                    id_collaborator: payload.id_collaborator || null,
                    type_notification: payload.type_notification,
                    id_order: payload.id_order || null,
                    id_group_order: payload.id_group_order || null,
                    id_promotion: payload.id_promotion || null,
                    id_transistion_collaborator: payload.id_transistion_collaborator || null,
                    id_transistion_customer: payload.id_transistion_customer || null,
                    id_transaction: payload.id_transaction || null,
                    date_create: new Date(Date.now()).toISOString(),
                    type_schedule: payload.type_schedule || null,
                    user_object: payload.user_object || 'collaborator',
                    is_push_notification: payload.is_push_notification || false,
                    is_notification: payload.is_notification || false,
                    status_send_socket: notFirebase ? STATUS_SEND_SOCKET.done : STATUS_SEND_SOCKET.create,
                    sound_guvi: payload.sound_guvi || NOTIFICATION_SOUND.default
                })
            
            return notification;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    // ham nay dung de chay tam tinh nang sendNotification
    async tempSendNotification() {
        try {


        } catch(err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async sendPushNotification(lang, notification) {
        try {
            const iPage = {
                start: 0,
                length: 2
            }
            const idUser = (notification.user_object === "collaborator") ? notification.id_collaborator : notification.id_customer;
            const query = {
                $and: [
                    {user_object: notification.user_object},
                    {user_id: idUser.toString()}
                ]
            }

            const getArrDevice = await this.deviceTokenRepositoryService.getListPaginationDataByCondition(iPage, {user_id: idUser.toString()}, {_id: 1, token: 1}, {date_create: -1})

            if(getArrDevice.data.length > 0) {
                let arrTokenDevice = []
                for(let i = 0 ; i < getArrDevice.data.length ; i++) {
                    arrTokenDevice.push(getArrDevice.data[i].token)
                }
                const payloadPushNoti = {
                    token: arrTokenDevice,
                    title: notification.title.vi,
                    body: notification.body.vi,
                    soundGuvi: (notification.user_object === "collaborator") ? true : false
                }
                await this.pushNotificationService.send(payloadPushNoti)
            }


            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    async sendMultiNotification(notification, arrIdUser, isSoundGuvi) {
        try {
            const iPage = {
                start: 0,
                length: 2
            }
            const arrUser = await this.splitArrIdUser(arrIdUser);
            
            for(let i = 0 ; i < arrUser.length ; i++) {
                for(let y = 0 ; y < arrUser[i].length ; y++) {
                    arrUser[i][y] = arrUser[i][y].toString()
                }
                const query = {
                    $and: [
                        {user_object: notification.user_object},
                        {user_id: {$in: arrUser[i]}}
                    ]
                }
                const getArrDevice = await this.deviceTokenRepositoryService.getListDataByCondition(query, {}, {date_create: -1})
                // console.log(getArrDevice.length, 'getArrDevice.length');
                
                if(getArrDevice.length > 0) {
                    let arrTokenDevice = []
                    for(let i = 0 ; i < getArrDevice.length ; i++) {
                        arrTokenDevice.push(getArrDevice[i].token)
                    }
                    const payloadPushNoti = {
                        token: arrTokenDevice,
                        title: notification.title,
                        body: notification.body,
                        soundGuvi: isSoundGuvi || true
                    }
                    // console.log(arrTokenDevice.length, 'arrTokenDevice');
                    
                    await this.pushNotificationService.send(payloadPushNoti)
                }
            }
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async setReaded(lang, idNotification){
        try {
            const getItem = await this.notificationRepositoryService.findOneById(idNotification);
            if(getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, "notification")], HttpStatus.NOT_FOUND);
            getItem.is_readed = true;
            await this.notificationRepositoryService.findByIdAndUpdate(getItem._id, getItem);
            return true;
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async setAllReadedByUser(lang, typeNotification, idUser: string) {
        try {
            await this.notificationRepositoryService.updateMany({
                $and: [
                    { id_customer: idUser },
                    { type_notification: typeNotification }
                ]
            }, { is_readed: true });
            return true;
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    async createGroupOrder(subjectAction, arrIdUser) {
        try {
            const payloadNoti = {
                title: "🔥 Có công việc mới !!!",
                body: "🤩 Có công việc mới hấp dẫn gần bạn \n👉 Nhấn để xem ngay nhé",
                data: "guvipartner://",
                user_object: 'collaborator'
            }

            await this.sendMultiNotification(payloadNoti, arrIdUser, true)
            return true;

        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async editGroupOrder() {
        try {
             
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async cancelGroupOrder(subjectAction, subjectSendNoti, groupOrder, order, minute, isPaymentFail: boolean = false, isExpired: boolean = false) {
        try {
            let payloadNoti = {
                title: {
                    en: "GUVI",
                    vi: "GUVI"
                },
                body: {
                    en: "",
                    vi: ""
                },
                ...await this.identifyUserReviceNoti(subjectSendNoti),
                type_notification: "activity",
                id_order: order._id,
                id_group_order: groupOrder._id,
                is_push_notification: true,
                is_notification: true
            }

            if(subjectSendNoti.type === "customer") {
                payloadNoti.id_customer = subjectSendNoti._id;
                if(subjectAction.type === "admin") {
                    payloadNoti.body = {
                        vi: `Dịch vụ ${groupOrder.id_view} đã được hủy. Hãy thử đặt lại vào một khung giờ khác thử xem nhé!`,
                        en: `Service ${groupOrder.id_view} has been cancelled. Try resetting for another time frame and see!`
                    }
                } else if (subjectAction.type === "customer") {
                    payloadNoti.body = {
                        vi: `Bạn đã hủy công việc ${groupOrder.id_view}. Nếu bạn cần hỗ trợ, vào "Tài khoản", chọn "Góp ý". Chúng tôi sẽ lắng nghe vấn đề của bạn và liên hệ lại bạn ngay khi nhận thông tin.`,
                        en: `You have canceled job ${groupOrder.id_view}. If you need support, go to "Account", select "Suggestions". We will listen to your problem and contact you as soon as we receive the information.`
                    }
                } else if (subjectAction.type === "collaborator") {
                if (minute > 60) {
                    payloadNoti.body = {
                        vi: `Oops, CTV "${subjectAction.full_name}" đã hủy công việc ${order.id_view} của bạn. Đừng lo, GUVI đang tìm kiếm "Cộng tác viên" mới cho bạn.`,
                        en: `Oops, Collaborator "${subjectAction.full_name}" canceled your job ${order.id_view}. Don't worry, GUVI is looking for new "Collaborators" for you.`
                    }
                } else if (minute > 30 && minute < 60) {
                    payloadNoti.body = {
                        vi: `Oops, CTV "${subjectAction.full_name}" đã hủy công việc ${order.id_view} của bạn. Đừng lo, GUVI đang tìm kiếm "Cộng tác viên" mới cho bạn. Hoặc liên hệ hotline 1900.0027 để được hỗ trợ ngay nhé.`,
                        en: `Oops, Collaborator "${subjectAction.full_name}" canceled your job ${order.id_view}. Don't worry, GUVI is looking for new "Collaborators" for you. Or contact hotline 1900.0027 for immediate support.`
                    }
                } else {
                    payloadNoti.body = {
                        vi: `Oops, CTV "${subjectAction.full_name}" đã hủy công việc ${order.id_view} của bạn. GUVI sẽ kiểm tra và xử lý vi phạm không được phép của CTV. Bạn hãy liên hệ hotline 1900.0027 để được hỗ trợ.`,
                        en: `Oops, Collaborator "${subjectAction.full_name}" canceled your job ${order.id_view}. GUVI will check and handle unauthorized violations by collaborators. Please contact hotline 1900.0027 for support.`
                    }
                }
                } else if (subjectAction.type === "system") {
                    if (isPaymentFail) {
                        payloadNoti.body = {
                            vi: `Đơn hàng của bạn đã bị hủy vì thanh toán thất bại. Bạn vui lòng đặt lại đơn hàng và chọn thanh toán bằng hình thức khác trên ứng dụng.`,
                            en: `Your order has been canceled due to payment failure. Please re-place your order and choose another form of payment on the app.`
                        }
                    } else if (isExpired) {
                        payloadNoti.body = {
                            vi: `Đơn hàng của bạn đã bị hủy vì quá hạn thanh toán trực tuyến.`,
                            en: `Your order has been canceled because online payment is overdue.`
                        }
                    } else {
                        payloadNoti.body = {
                            vi: `Hiện tại, tất cả "Cộng tác viên" đều đang bận hoặc chưa thể nhận ca làm của bạn. Hãy thử đặt lại vào một khung giờ khác thử xem nhé!\nĐơn ${groupOrder.id_view} đã được hủy tự động, bạn không cần phải làm gì cả.`,
                            en: `Currently, all "Collaborators" are busy or cannot accept your shift. Please try again at another time!\nOrder ${groupOrder.id_view} has been canceled automatically, you do not need to do anything.`
                        }
                    }
                }
            } else if (subjectSendNoti.type === "collaborator") {
                payloadNoti.id_collaborator = subjectSendNoti._id;
                payloadNoti.title = {
                    en: "GUVI Partner",
                    vi: "GUVI Partner"
                }
                if (subjectAction.type === "collaborator") {
                    payloadNoti.body = {
                        vi: `✅ Bạn đã "Hủy" ca làm ${order.id_view}`,
                        en: `✅ You cancel order ${order.id_view}`
                    }
                } else {
                    payloadNoti.body = {
                        vi: `Dịch vụ ${groupOrder.id_view} đã bị hủy`,
                        en: `Service ${groupOrder.id_view} is canceled`
                    }
                }
            }

            payloadNoti = await this.createItem(payloadNoti);

            return payloadNoti;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async createOrder() {
        try {
             
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async editOrder() {
        try {
             
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async cancelOrder(subjectAction, subjectSendNoti, groupOrder, order, minute) {
        try {
            let payloadNoti = {
                title: {
                    en: "GUVI",
                    vi: "GUVI"
                },
                body: {
                    en: "",
                    vi: ""
                },
                ...await this.identifyUserReviceNoti(subjectSendNoti),
                type_notification: TYPE_NOTIFICATION.activity,
                id_order: order._id,
                id_group_order: groupOrder._id,
                is_push_notification: true,
                is_notification: true
            }

            if(subjectSendNoti.type === "customer") {
                payloadNoti.id_customer = subjectSendNoti._id;
                if(subjectAction.type === "admin") {
                    payloadNoti.body = {
                        vi: `Dịch vụ ${groupOrder.id_view} đã được hủy. Hãy thử đặt lại vào một khung giờ khác thử xem nhé!`,
                        en: `Service ${groupOrder.id_view} has been cancelled. Try resetting for another time frame and see!`
                    }
                } else if (subjectAction.type === "customer") {
                    payloadNoti.body = {
                        vi: `Bạn đã hủy công việc ${groupOrder.id_view}. Nếu bạn cần hỗ trợ, vào "Tài khoản", chọn "Góp ý". Chúng tôi sẽ lắng nghe vấn đề của bạn và liên hệ lại bạn ngay khi nhận thông tin.`,
                        en: `You have canceled job ${groupOrder.id_view}. If you need support, go to "Account", select "Suggestions". We will listen to your problem and contact you as soon as we receive the information.`
                    }
                } else if (subjectAction.type === "collaborator") {
                if (minute > 60) {
                    payloadNoti.body = {
                        vi: `Oops, CTV "${subjectAction.full_name}" đã hủy công việc ${order.id_view} của bạn. Đừng lo, GUVI đang tìm kiếm "Cộng tác viên" mới cho bạn.`,
                        en: `Oops, Collaborator "${subjectAction.full_name}" canceled your job ${order.id_view}. Don't worry, GUVI is looking for new "Collaborators" for you.`
                    }
                } else if (minute > 30 && minute < 60) {
                    payloadNoti.body = {
                        vi: `Oops, CTV "${subjectAction.full_name}" đã hủy công việc ${order.id_view} của bạn. Đừng lo, GUVI đang tìm kiếm "Cộng tác viên" mới cho bạn. Hoặc liên hệ hotline 1900.0027 để được hỗ trợ ngay nhé.`,
                        en: `Oops, Collaborator "${subjectAction.full_name}" canceled your job ${order.id_view}. Don't worry, GUVI is looking for new "Collaborators" for you. Or contact hotline 1900.0027 for immediate support.`
                    }
                } else {
                    payloadNoti.body = {
                        vi: `Oops, CTV "${subjectAction.full_name}" đã hủy công việc ${order.id_view} của bạn. GUVI sẽ kiểm tra và xử lý vi phạm không được phép của CTV. Bạn hãy liên hệ hotline 1900.0027 để được hỗ trợ.`,
                        en: `Oops, Collaborator "${subjectAction.full_name}" canceled your job ${order.id_view}. GUVI will check and handle unauthorized violations by collaborators. Please contact hotline 1900.0027 for support.`
                    }
                }
                } else if (subjectAction.type === "system") {
                    payloadNoti.body = {
                    vi: `Hiện tại, tất cả "Cộng tác viên" đều đang bận hoặc chưa thể nhận ca làm của bạn. Hãy thử đặt lại vào một khung giờ khác thử xem nhé!\nĐơn ${groupOrder.id_view} đã được hủy tự động, bạn không cần phải làm gì cả.`,
                    en: `Currently, all "Collaborators" are busy or cannot accept your shift. Please try again at another time!\nOrder ${groupOrder.id_view} has been canceled automatically, you do not need to do anything.`
                    }
                }
            } else if (subjectSendNoti.type === "collaborator") {
                payloadNoti.id_customer = subjectSendNoti._id;
                payloadNoti.title = {
                    en: "GUVI Partner",
                    vi: "GUVI Partner"
                }
                if (subjectAction.type === "collaborator") {
                    payloadNoti.body = {
                        vi: `✅ Bạn đã "Hủy" ca làm ${order.id_view}`,
                        en: `✅ You cancel order ${order.id_view}`
                    }
                } else {
                    payloadNoti.body = {
                        vi: `Dịch vụ ${groupOrder.id_view} đã bị hủy`,
                        en: `Service ${groupOrder.id_view} is canceled`
                    }
                }
            }

            return await this.createItem(payloadNoti);
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async refundCollaborator(payloadDependency, money) {
        try {
            const getOrder = payloadDependency.order
            const formatMoney = await this.generalHandleService.formatMoney(money)
            let payloadNotiCollaborator = {
                title: {
                    en: "GUVI Partner",
                    vi: "GUVI Partner"
                },
                body: {
                    vi: `Ca làm ${getOrder.id_view} đã bị hủy. Bạn được hoàn lại ${formatMoney}`,
                    en: `Shift ${getOrder.id_view} has been cancelled. You will receive a refund of ${formatMoney}"`
                },
                user_object: "collaborator",
                id_collaborator: getOrder.id_collaborator || null,
                type_notification: "activity",
                id_order: getOrder._id,
                id_group_order: getOrder.id_group_order,
                is_push_notification: true,
                is_notification: true
            }
            return await this.createItem(payloadNotiCollaborator);
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async refundCustomer(payloadDependency, money) {
        try {
            const getGroupOrder = payloadDependency.group_order;
            const getOrder = payloadDependency.order || null;
            const getCustomer = payloadDependency.customer;

            const formatMoney = await this.generalHandleService.formatMoney(money)
            let payloadNotiCustomer = {
                title: {
                    en: "Refund success !",
                    vi: "Hoàn tiền thành công từ!"
                },
                body: {
                    vi: `Bạn đã được hoàn ${formatMoney} vào ví Gpay do đơn ${getGroupOrder.id_view} bị hủy.`,
                    en: `You have received a refund of ${formatMoney} to your Gpay wallet because order ${getGroupOrder.id_view} was canceled.`
                },
                user_object: TYPE_USER_OBJECT.customer,
                id_customer: getCustomer._id,
                type_notification: TYPE_NOTIFICATION.activity,
                id_order: (getOrder) ? getOrder._id : null,
                id_group_order: getGroupOrder._id,
                is_push_notification: true,
                is_notification: true
            }
            if(getOrder) {
                payloadNotiCustomer.body = {
                    vi: `Bạn đã được hoàn ${formatMoney} vào ví Gpay do đơn ${getOrder.id_view} bị hủy.`,
                    en: `You have received a refund of ${formatMoney} to your Gpay wallet because order ${getOrder.id_view} was canceled.`
                }
            }
            return await this.createItem(payloadNotiCustomer);
        } catch(err){
            throw new HttpException(err.response || err.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async sendNotiPunish(subjectSendNoti, payloadDependency, money) {
        try {
            const getPunishTicket = payloadDependency.punish_ticket
            const getGroupOrder = payloadDependency.group_order
            const getOrder = payloadDependency.order
            const formatMoney = await this.generalHandleService.formatMoney(money)
            let payloadNoti = {
                title: {
                    en: "GUVI Partner",
                    vi: "GUVI Partner"
                },
                body: {
                    vi: `Bạn đã bị phạt ${formatMoney} vì lý do ${getPunishTicket.note_admin}`,
                    en: `You have been punish ${formatMoney} for reason ${getPunishTicket.note_admin}`
                },
                ...await this.identifyUserReviceNoti(subjectSendNoti),
                type_notification: "activity",
                id_order: (getOrder) ? getOrder._id : null,
                id_group_order: getGroupOrder._id,
                is_push_notification: true,
                is_notification: true
            }

            payloadNoti = await this.createItem(payloadNoti);
            return payloadNoti;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async createItemTest(listOfData) {
        try {
            

            const lstTask:any = []

            if (listOfData.length > 0) {
                for (let i = 0; i < listOfData.length; i++) {
                    lstTask.push({
                        title: {
                            vi:"Tiêu đề thông báo test",
                            en:""
                        },
                        body: { 
                            vi:"Niềm vui tinh thần có vô vàn cách để vui vẻ, bạn bè cũng không phải đến với nhau vì tiền bạc. Kiến thức trên đời cũng không phải tốn kém để được học.Để an vui cũng không cần quá nhiều tiền để có thể hạnh phúc. Để tồn tại, để mạnh khỏe và vui vẻ, về bản chất không cần quá nhiều của cải.",
                            en:""
                        },
                        description: { 
                            vi:"Niềm vui tinh thần có vô vàn cách để vui vẻ, bạn bè cũng không phải đến với nhau vì tiền bạc. Kiến thức trên đời cũng không phải tốn kém để được học.Để an vui cũng không cần quá nhiều tiền để có thể hạnh phúc. Để tồn tại, để mạnh khỏe và vui vẻ, về bản chất không cần quá nhiều của cải.",
                            en:""
                        },
                        id_customer: listOfData[i]._id || null,
                        id_collaborator: null,
                        type_notification: "activity",
                        id_order: null,
                        id_group_order: null,
                        id_promotion: null,
                        id_transistion_collaborator: null,
                        id_transistion_customer: null,
                        id_transaction: null,
                        date_create: new Date().toISOString(),
                        type_schedule: null,
                        user_object: 'collaborator',
                        is_push_notification: false,
                        is_notification:  false,
                    })
                }           
            }

            await this.notificationRepositoryService.createMany(lstTask)

            return true
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async createGroupOrderNoti(listOfData) {
        try {
            const lstTask:any = []

            if (listOfData.length > 0) {
                for (let i = 0; i < listOfData.length; i++) {
                    lstTask.push({
                        title: {
                            en: `🔥 Have a new job !!!`,
                            vi: `🔥 Có công việc mới !!!`,
                        },
                        body: {
                            en: `🤩 Have a fascinating new job near you \n👉 Click to watch now"`,
                            vi: `🤩 Có công việc mới hấp dẫn gần bạn \n👉 Nhấn để xem ngay nhé"`,
                        },
                        description: { 
                            en: `🤩 Have a fascinating new job near you \n👉 Click to watch now"`,
                            vi: `🤩 Có công việc mới hấp dẫn gần bạn \n👉 Nhấn để xem ngay nhé"`,
                        },
                        id_customer: null,
                        id_collaborator: listOfData[i] || null,
                        type_notification: TYPE_NOTIFICATION.activity,
                        id_order: null,
                        id_group_order: null,
                        id_promotion: null,
                        id_transistion_collaborator: null,
                        id_transistion_customer: null,
                        id_transaction: null,
                        date_create: new Date().toISOString(),
                        type_schedule: null,
                        user_object: TYPE_USER_OBJECT.collaborator,
                        is_push_notification: true,
                        is_notification: true,
                        sound_guvi: NOTIFICATION_SOUND.duplicatesoundguvi
                    })
                }           
            }

            return await this.notificationRepositoryService.createMany(lstTask)
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updatePushTime(lang, idNotification) {
        try {
            const notification = await this.getDetailItem(lang, idNotification)
            notification.push_time = new Date(Date.now()).toISOString()
            notification.status_send_socket = STATUS_SEND_SOCKET.processing
            await this.notificationRepositoryService.findByIdAndUpdate(idNotification, notification)

            return true
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateStatusSendSocket(lang, idNotification, status_send_socket) {
        try {
            const notification = await this.getDetailItem(lang, idNotification)
            if (notification.status_send_socket === STATUS_SEND_SOCKET.processing) {
                notification.status_send_socket = STATUS_SEND_SOCKET[status_send_socket]
                await this.notificationRepositoryService.findByIdAndUpdate(idNotification, notification)
            }

            return true
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateFirebaseDoneManyNoti(lstId) {
        try {
            const query = {
                $and:[ 
                    { _id: { $in : lstId } }
                ]
            }

            await this.notificationRepositoryService.updateMany(query, { $set: { status_send_firebase: STATUS_SEND_FIREBASE.done } })

            return true
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateFirebaseFailManyNoti(lstId) {
        try {
            const query = {
                $and:[ 
                    { _id: { $in : lstId } }
                ]
            }

            await this.notificationRepositoryService.updateMany(query, { $set: { status_send_firebase: STATUS_SEND_FIREBASE.fail } })

            return true
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    
    async updateFailStatusForManyNotiUsingSocket() {
        try {
            const query = {
                $and: [
                    { status_send_socket: STATUS_SEND_SOCKET.processing },
                ]
            }

            await this.notificationRepositoryService.updateMany(query, { $set: { status_send_socket: STATUS_SEND_SOCKET.fail } })

            return true
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateFailStatusUsingSocket(lang, idNotification) {
        try {
            const notification = await this.getDetailItem(lang, idNotification)
            notification.push_time = new Date(Date.now()).toISOString()
            notification.status_send_socket = STATUS_SEND_SOCKET.fail
            await this.notificationRepositoryService.findByIdAndUpdate(idNotification, notification)

            return true
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getListForPushNotificationForSocket(isCustomer) {
        try {
            // Lay danh sach thong bao co thoi gian ban nho hon hoac bang thoi gian hien tai
            const dateNow = new Date(Date.now()).toISOString()
            const query:any = {
                $and: [
                    { is_notification: false },
                    { user_object: isCustomer ? 'customer' : 'collaborator' },
                    { type_notification: TYPE_NOTIFICATION.system },
                    { date_schedule: { $lt: dateNow } },
                    { status_send_socket: STATUS_SEND_SOCKET.create },
                    { push_time: null },
                ]
            }
            if(isCustomer) {
                query.$and.push({ id_customer: { $ne: null } })
            } else {
                query.$and.push({ id_collaborator: { $ne: null } })
            }

            const result = await 
                this.notificationRepositoryService.getListPaginationDataByCondition( { start: 0, length: 50 }, query, {}, { date_create: 1 })
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getListForPushNotificationForFirebase() {
        try {
            // Lay danh sach thong bao gui qua websocket ma khong co phan hoi 
            const fiveSecondsAgo = new Date(Date.now() - 5 * 1000).toISOString()
            const query = {
                $or: [
                    { 
                        $and: [
                            { status_send_socket: STATUS_SEND_SOCKET.create },
                            { status_send_firebase: STATUS_SEND_FIREBASE.none },
                            { date_schedule: null },
                            { date_create: { $lt: fiveSecondsAgo } }
                        ] 
                    },
                    { 
                        $and: [
                            { status_send_socket: STATUS_SEND_SOCKET.fail },
                            { status_send_firebase: STATUS_SEND_FIREBASE.none },
                        ] 
                    },
                ]  
            }

            const result = await 
                this.notificationRepositoryService.getListPaginationDataByCondition({ start: 0, length: 50 }, query, {}, { is_notification: -1, date_create: 1, date_schedule: 1 })
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async createListNotification(listOfData, payload, type_user_object) {
        try {
            const lstTask:any = []

            if (listOfData.length > 0) {
                for (let i = 0; i < listOfData.length; i++) {
                    lstTask.push({
                        title: {
                            vi: payload.title,
                            en:""
                        },
                        body: { 
                            vi: payload.body,
                            en:""
                        },
                        description: { 
                            vi: payload.body,
                            en:""
                        },
                        id_customer: TYPE_USER_OBJECT[type_user_object] === TYPE_USER_OBJECT.customer ? listOfData[i]._id : null,
                        id_collaborator: TYPE_USER_OBJECT[type_user_object] === TYPE_USER_OBJECT.collaborator ? listOfData[i]._id : null,
                        type_notification: TYPE_NOTIFICATION.system,
                        id_order: null,
                        id_group_order: null,
                        id_promotion: null,
                        id_transistion_collaborator: null,
                        id_transistion_customer: null,
                        id_transaction: null,
                        date_create: new Date().toISOString(),
                        date_schedule: new Date(payload.date_schedule).toISOString(),
                        image_url: payload.image_url,
                        type_schedule: null,
                        user_object: TYPE_USER_OBJECT[type_user_object],
                        is_push_notification: true,
                        is_notification: false,
                        sound_guvi: payload.sound_guvi
                    })
                }           
            }

            await this.notificationRepositoryService.createMany(lstTask)

            return true
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async deleteManyNotificationSchedule() {
        try {
            const query = {
                $and: [
                    { date_schedule: { $lt: new Date(Date.now()).toISOString() } },
                    { is_notification: false }
                ]
            }

            const result = await this.notificationRepositoryService.deleteMany(query)

            return result
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateFailStatusForManyNotiUsingFirebase() {
        try {
            const dateDelay = new Date(Date.now() - 2 * 60 * 1000).toISOString();

            const query = {
                $and: [
                    { push_time: { $lt: dateDelay } },
                    { status_send_socket: STATUS_SEND_SOCKET.fail },
                    { status_send_firebase: STATUS_SEND_FIREBASE.none },
                ]
            }

            await this.notificationRepositoryService.updateMany(query, { $set: { status_send_firebase: STATUS_SEND_FIREBASE.fail } })

            return true
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}