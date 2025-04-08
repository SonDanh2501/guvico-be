import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { Types } from 'mongoose'
import { LIMIT_NOTIFICATIONS, LIMIT_USERS, PERIOD_NOTIFICATION_GENERATE } from 'src/@core/constant'
import { iPageNotificationDTO } from 'src/@core/dto/notification.dto'
import { TYPE_WALLET } from 'src/@repositories/module/mongodb/@database/enum'
import { TYPE_SERVER_GATEWAY, TYPE_USER_OBJECT } from 'src/@repositories/module/mongodb/@database/enum/base.enum'
import { TYPE_NOTIFICATION } from 'src/@repositories/module/mongodb/@database/enum/notification.enum'
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service'
import { CollaboratorOopSystemService } from 'src/core-system/@oop-system/collaborator-oop-system/collaborator-oop-system.service'
import { CustomerOopSystemService } from 'src/core-system/@oop-system/customer-oop-system/customer-oop-system.service'
import { DeviceTokenOopSystemService } from 'src/core-system/@oop-system/device-token-oop-system/device-token-oop-system.service'
import { NotificationOopSystemService } from 'src/core-system/@oop-system/notification-oop-system/notification-oop-system.service'
import { NotificationScheduleSystemService } from '../notification-schedule-system/notification-schedule-system.service'
import { PushNotificationSystemService } from '../push-notification-system/push-notification-system.service'

@Injectable()
export class NotificationSystemService {
    constructor (
    private collaboratorOopSystemService: CollaboratorOopSystemService,
    private notificationOopSystemService: NotificationOopSystemService,
    private customerOopSystemService: CustomerOopSystemService,
    private deviceTokenOopSystemService: DeviceTokenOopSystemService,

    private notificationScheduleSystemService: NotificationScheduleSystemService,
    private pushNotificationSystemService: PushNotificationSystemService,
    
    private generalHandleService: GeneralHandleService

    ){}

    private isCreateNotiFunctionRunning: boolean = false
    private isSendNotiFunctionRunning: boolean = false
    private isSendNotiFuncRunningForCollaborator: boolean = false

    async getList(lang, subjectAciton, iPage: iPageNotificationDTO) {
        try {
            return await this.notificationOopSystemService.getList(lang, subjectAciton, iPage)
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async refundCustomer(lang, payloadDependency, money) {
        try {
            const getCustomer = payloadDependency.customer;

            const notification = await this.notificationOopSystemService.refundCustomer(payloadDependency, money);
            // Ban thong bao
            await this.pushNotificationSystemService.sendNotificationUsingSocket(lang, TYPE_SERVER_GATEWAY.customer, getCustomer.session_socket, notification)
            return true;
        } catch(err){
            throw new HttpException(err.response || err.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async refundCollaborator(lang, payloadDependency, money) {
        try {
            const getCollaborator = payloadDependency.collaborator

            const notification = await this.notificationOopSystemService.refundCollaborator(payloadDependency, money);
            // Ban thong bao
            await this.pushNotificationSystemService.sendNotificationUsingSocket(lang, TYPE_SERVER_GATEWAY.collaborator, getCollaborator.session_socket, notification)
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async sendNotiPunish(lang, subjectSendNoti, payloadDependency, money) {
        try {
            const getCollaborator = payloadDependency.collaborator

            const notification = await this.notificationOopSystemService.sendNotiPunish(subjectSendNoti, payloadDependency, money);
            // Ban thong bao
            await this.pushNotificationSystemService.sendNotificationUsingSocket(lang, TYPE_SERVER_GATEWAY.collaborator, getCollaborator.session_socket, notification)
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async createGroupOrder(lang, subjectAction, payloadDependency, customer, isNoti) {
        try {
            let payloadNotiCustom = {
                title: {
                    en: `GUVI`,
                    vi: `GUVI`,
                },
                body: {
                    en: `GUVI is looking for "Collaborators" for you. Click to see details.`,
                    vi: `GUVI đang tìm kiếm "Cộng tác viên" cho bạn. Nhấp để xem chi tiết.`,
                },
                user_object: TYPE_USER_OBJECT.customer,
                id_customer: payloadDependency?.customer?._id || null,
                type_notification: TYPE_NOTIFICATION.activity,
                id_order: payloadDependency?.order?._id,
                is_push_notification: true,
                is_notification: true
            }

            const notification =  await this.notificationOopSystemService.createItem(payloadNotiCustom);

            // Ban thong bao
            await this.pushNotificationSystemService.sendNotificationUsingSocket(lang, TYPE_SERVER_GATEWAY.customer, customer.session_socket, notification)
            const getGroupOrder = payloadDependency.group_order;
            let itemId = []
            let getList = []
            if (getGroupOrder.id_favourite_collaborator.length > 0) {
                getList = await this.collaboratorOopSystemService.getCollaboratorFavourite(getGroupOrder);
            } else {
                getList = await this.collaboratorOopSystemService.getCollaboratorForGroupOrder(getGroupOrder);                
            }

            itemId = getList.map((e) => e._id)

            if (isNoti) {       
                const lstNotification = await this.notificationOopSystemService.createGroupOrderNoti(itemId)

                for (let i = 0 ; i < getList.length ; i += LIMIT_USERS) {
                    let newList = getList.slice(i, i + LIMIT_USERS)
                    let newLstNotification = lstNotification.slice(i, i + LIMIT_USERS)
                    
                    for (let j = 0; j < newList.length; j ++) {
                        this.pushNotificationSystemService.sendNotificationUsingSocket(lang, TYPE_SERVER_GATEWAY.collaborator, newList[j].session_socket, newLstNotification[j])
                    }
                }
            }

            return true
        } catch(err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

        async cancelOrder(lang, subjectAction, subjectSendNoti, groupOrder, order, minute) {
        try {
            const notification = await this.notificationOopSystemService.cancelOrder(subjectAction, subjectSendNoti, groupOrder, order, minute)

            if(subjectSendNoti.type === "customer") {
                // Ban thong bao
                await this.pushNotificationSystemService.sendNotificationUsingSocket(lang, TYPE_SERVER_GATEWAY.customer, subjectSendNoti.customer.session_socket, notification)
            }
            
            if(subjectSendNoti.type === "collaborator") {
                // Ban thong bao
                await this.pushNotificationSystemService.sendNotificationUsingSocket(lang, TYPE_SERVER_GATEWAY.collaborator, subjectSendNoti.collaborator.session_socket, notification)
            }

            return true
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async confirmOrder(lang, idGroupOrder, order, customer, collaborator) {
        try {
            let payloadNotiCustom = {
                title: {
                    en: `${collaborator.full_name} confirmed order ${order.id_view}`,
                    vi: `${collaborator.full_name} đã xác nhận đơn ${order.id_view}`,
                },
                body: {
                    en: `${collaborator.full_name} accepted the job. Please keep your phone in communication mode and be ready to describe the work further when the "Collaborator" arrives`,
                    vi: `${collaborator.full_name} đã nhận việc. Vui lòng giữ điện thoại ở chế độ liên lạc và sẵn sàng mô tả thêm về công việc khi "Cộng tác viên" đến nơi`,
                },
                user_object: TYPE_USER_OBJECT.customer,
                id_customer: order.id_customer,
                type_notification: TYPE_NOTIFICATION.activity,
                id_order: order._id,
                is_push_notification: true,
                is_notification: true
            }

            let payloadNotiCollaborator = {
                title: {
                    en: `Take job success`,
                    vi: `Nhận việc thành công`,
                },
                body: {
                    en: `Congratulation!! You had took the job successfully`,
                    vi: `Chúc mừng bạn đã nhận việc thành công `,
                },
                user_object: TYPE_USER_OBJECT.collaborator,
                id_collaborator: collaborator._id || null,
                type_notification: TYPE_NOTIFICATION.activity,
                id_order: order._id,
                id_group_order: idGroupOrder,
                is_push_notification: true,
                is_notification: true
            }

            // Tao thong bao
            const notificationForCustomer =  await this.notificationOopSystemService.createItem(payloadNotiCustom);
            // Ban thong bao
            await this.pushNotificationSystemService.sendNotificationUsingSocket(lang, TYPE_SERVER_GATEWAY.customer, customer.session_socket, notificationForCustomer)
            if (payloadNotiCollaborator.id_collaborator !== null) {
                // Tao thong bao
                const notificationForCollaborator = await this.notificationOopSystemService.createItem(payloadNotiCollaborator);
                // Ban thong bao
                await this.pushNotificationSystemService.sendNotificationUsingSocket(lang, TYPE_SERVER_GATEWAY.collaborator, collaborator.session_socket, notificationForCollaborator)
            }

            return true
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async minusPlatformFee(lang, idGroupOrder, order, collaborator, platformFee) {
        try {
            const formatPlatformFee = await this.generalHandleService.formatMoney(platformFee);

            let payloadNotiMinusPlatformFee = {
                title: {
                    en: `Minus platformfee from order ${order.id_view}`,
                    vi: `Thu phí dịch vụ đơn hàng ${order.id_view}`,
                },
                body: {
                    vi: `Xác nhận nhận đơn hàng ${order.id_view}".\nThu phí dịch vụ ${formatPlatformFee}.`,
                    en: `Order ${order.id_view} has been confirmed.\nService fee ${formatPlatformFee} collected.`
                },
                user_object: TYPE_USER_OBJECT.collaborator,
                id_collaborator: collaborator._id || null,
                type_notification: TYPE_NOTIFICATION.activity,
                id_order: order._id,
                id_group_order: idGroupOrder,
                is_push_notification: true,
                is_notification: true
            }

            const notification =  await this.notificationOopSystemService.createItem(payloadNotiMinusPlatformFee);

             // Ban thong bao
            await this.pushNotificationSystemService.sendNotificationUsingSocket(lang, TYPE_SERVER_GATEWAY.collaborator, collaborator.session_socket, notification)

            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async doingOrder(lang, idGroupOrder, order, customer, collaborator) {
        try {
            let payloadNotiCustom = {
                title: {
                    en: "Collaborator is doing this job",
                    vi: "CTV đang làm công việc"
                },
                body: {
                    vi: `${collaborator.full_name} đã xác nhận bắt đầu ca làm việc. Nếu CTV vẫn chưa tới, vui lòng liên hệ hotline 0877.363.999 để được hỗ trợ.`,
                en: `${collaborator.full_name} shift start confirmed. If collaborators still have not arrived, please contact hotline 0877.363.999 for assistance.`
                },
                user_object: TYPE_USER_OBJECT.customer,
                id_customer: order.id_customer,
                type_notification: TYPE_NOTIFICATION.activity,
                id_order: order._id,
                is_push_notification: true,
                is_notification: true
            }

            let payloadNotiCollaborator = {
                title: {
                    en: `Start working job`,
                    vi: `Bắt đầu làm công việc`,
                },
                body: {
                    vi: `✅ Bạn đã nhấn "Bắt đầu" ca làm ${order.id_view} \n 👉 Nhớ xuất trình CCCD và trao đổi công việc với khách hàng !!!`,
                    en: `✅ You pressed "Start" shift ${order.id_view} \n 👉 Remember to present your ID and discuss work with customer !!!`
                },
                user_object: TYPE_USER_OBJECT.collaborator,
                id_collaborator: collaborator._id || null,
                type_notification: TYPE_NOTIFICATION.activity,
                id_order: order._id,
                id_group_order: idGroupOrder,
                is_push_notification: true,
                is_notification: true
            }

            // Tao thong bao
            const notificationForCustomer =  await this.notificationOopSystemService.createItem(payloadNotiCustom);
            // Ban thong bao
            await this.pushNotificationSystemService.sendNotificationUsingSocket(lang, TYPE_SERVER_GATEWAY.customer, customer.session_socket, notificationForCustomer)

            if(payloadNotiCollaborator.id_collaborator !== null) {
                // Tao thong bao
                const notificationForCollaborator = await this.notificationOopSystemService.createItem(payloadNotiCollaborator);
                // Ban thong bao
                await this.pushNotificationSystemService.sendNotificationUsingSocket(lang, TYPE_SERVER_GATEWAY.collaborator, collaborator.session_socket, notificationForCollaborator)
            }
            
            return { payloadNotiCustom, payloadNotiCollaborator };
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async doneOrder(lang, idGroupOrder, order, customer,  collaborator) {
        try {
            let payloadNotiCustom = {
                title: {
                    en: "Collaborator is done this job",
                    vi: "CTV đã làm xong công việc"
                },
                body: {
                    vi: `"Cộng tác viên" đã hoàn thành công việc của mình. Bạn hãy dành ít phút để kiểm tra lại mọi thứ nhé.`,
                    en: `"Collaborator" has completed her/his work. Please take a few minutes to check everything.`
                },
                user_object: TYPE_USER_OBJECT.customer,
                id_customer: order.id_customer,
                type_notification: TYPE_NOTIFICATION.activity,
                id_order: order._id,
                is_push_notification: true,
                is_notification: true
            }

            let payloadNotiCollaborator = {
                title: {
                    en: `Complete job`,
                    vi: `Hoàn thành công việc`,
                },
                body: {
                    vi: `✅ Bạn đã nhấn "Kết thúc" ca làm ${order.id_view} \n 👉 Đổ rác (nếu có) và chào khách ra về bạn nhé !!!`,
                    en: `✅ You pressed "Finish" shift ${order.id_view} \n 👉 Take out the trash (if any) and welcome customer to leave !!!`
                },
                user_object: TYPE_USER_OBJECT.collaborator,
                id_collaborator: collaborator._id || null,
                type_notification: TYPE_NOTIFICATION.activity,
                id_order: order._id,
                id_group_order: idGroupOrder._id,
                is_push_notification: true,
                is_notification: true
            }

            // Tao thong bao
            const notificationForCustomer = await this.notificationOopSystemService.createItem(payloadNotiCustom);
 // Ban thong bao
 await this.pushNotificationSystemService.sendNotificationUsingSocket(lang, TYPE_SERVER_GATEWAY.customer, customer.session_socket, notificationForCustomer)

            if (payloadNotiCollaborator.id_collaborator !== null) {
                // Tao thong bao
                const notificationForCollaborator = await this.notificationOopSystemService.createItem(payloadNotiCollaborator);
                // Ban thong bao
                await this.pushNotificationSystemService.sendNotificationUsingSocket(lang, TYPE_SERVER_GATEWAY.collaborator, collaborator.session_socket, notificationForCollaborator)
            }
            
            return true
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async addPoint(lang, order, customer, point) {
        try {
            let payloadNotiCustomer = {
                title: {
                    en: `Get points from order ${order.id_view}`,
                    vi: `Cộng điểm từ đơn hàng ${order.id_view}`
                },
                body: {
                    en: `You got ${point} points from the order ${order.id_view}.`,
                    vi: `Bạn được cộng ${point} điểm từ đơn hàng ${order.id_view}.`
                },
                user_object: TYPE_USER_OBJECT.customer,
                id_customer: customer._id,
                type_notification: TYPE_NOTIFICATION.activity,
                id_order: order._id,
                is_push_notification: true,
                is_notification: true
            }

            // Tao thong bao
            const notification = await this.notificationOopSystemService.createItem(payloadNotiCustomer);
// Ban thong bao
await this.pushNotificationSystemService.sendNotificationUsingSocket(lang, TYPE_SERVER_GATEWAY.customer, customer.session_socket, notification)

            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async addPayPoint(lang, customer, inviter, money, isCustomer) {
        try {
            const formatMoney = await this.generalHandleService.formatMoney(money);
            
            let payloadNotiInviter = {
                title: {
                    vi: `Bạn "${customer.full_name}" của bạn đã hoàn thành đơn hàng đầu tiên. Bạn được nhận thưởng ${formatMoney} vào Ví Gpay.
            Cùng tải app, cùng chung vui !!! Nhấn đây để xem chi tiết.`,
                en: `Your friend "${customer.full_name}" has completed his first order. You will receive a ${formatMoney} reward into your Gpay Wallet.
                Download the app and have fun together!!! Click here to see details`
                },
                body: {
                    vi: `Bạn "${customer.full_name}" của bạn đã hoàn thành đơn hàng đầu tiên. Bạn được nhận thưởng ${formatMoney} vào Ví Gpay.
                    Cùng tải app, cùng chung vui !!! Nhấn đây để xem chi tiết.`,
                        en: `Your friend "${customer.full_name}" has completed his first order. You will receive a ${formatMoney} reward into your Gpay Wallet.
                        Download the app and have fun together!!! Click here to see details`
                },
                user_object: isCustomer ? TYPE_USER_OBJECT.customer : TYPE_USER_OBJECT.collaborator,
                id_customer: isCustomer ? inviter._id : null,
                id_collaborator: !isCustomer ? inviter._id : null,
                type_notification: TYPE_NOTIFICATION.activity,
                is_push_notification: true,
                is_notification: true
            }

            const notification =  await this.notificationOopSystemService.createItem(payloadNotiInviter);
            if(isCustomer) {
                // Ban thong bao
                await this.pushNotificationSystemService.sendNotificationUsingSocket(lang, TYPE_SERVER_GATEWAY.customer, inviter.session_socket, notification)
            } else {
                await this.pushNotificationSystemService.sendNotificationUsingSocket(lang, TYPE_SERVER_GATEWAY.collaborator, inviter.session_socket, notification)
            }

            return payloadNotiInviter;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async receiveRefundMoney(lang, idGroupOrder, order,  collaborator, refundMoney) {
        try {
            const formatRefundMoney = await this.generalHandleService.formatMoney(refundMoney);

            let payloadNotiCollaborator = {
                title: {
                    en: `Get net income from order ${order.id_view}`,
                    vi: `Nhận thu nhập ròng từ ca làm ${order.id_view}`
                },
                body: {
                    vi: `Bạn đã nhận được thu nhập ${formatRefundMoney} từ ca làm ${order.id_view} trong ví CTV.`,
                    en: `You have received income of ${formatRefundMoney} for order ${order.id_view} in your collaborator wallet.`
                },
                user_object: TYPE_USER_OBJECT.collaborator,
                id_collaborator: collaborator._id || null,
                type_notification: TYPE_NOTIFICATION.activity,
                id_order: order._id,
                id_group_order: idGroupOrder,
                is_push_notification: true,
                is_notification: true
            }

            const notification = await this.notificationOopSystemService.createItem(payloadNotiCollaborator);
            // Ban thong bao
            await this.pushNotificationSystemService.sendNotificationUsingSocket(lang, TYPE_SERVER_GATEWAY.collaborator, collaborator.session_socket, notification)

            return true
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    async createItemTestNoti() {
        try {
            const start = performance.now();

            // const query = {
            //     $and: [
            //         { _id: { $exists: 1 } },
                    
            //     ]
            // }
            // const getListCustomer = await this.customerOopSystemService.getListItemForPushNoti(query)

            // await this.notificationOopSystemService.createItemTest(getListCustomer)

            const end = performance.now();

            console.log(`Execution time: ${end - start} ms`);

            return {message: `Execution time: ${end - start} ms`}
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updatePushTime(lang, idNotification) {
        try { 
            await this.notificationOopSystemService.updatePushTime(lang, idNotification);
            return true
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);

        }
    }

    async updateStatusSendSocket(lang, idNotification, status_send_socket) {
        try { 
            if(idNotification) {
                await this.notificationOopSystemService.updateStatusSendSocket(lang, idNotification, status_send_socket);
            }
            return true
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);

        }
    }

    async updateFailStatusForManyNotiUsingSocket() {
        try { 
            await this.notificationOopSystemService.updateFailStatusForManyNotiUsingSocket();
            return true
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getListForPushNotification(isCustomer) {
        try { 
            return await this.notificationOopSystemService.getListForPushNotificationForSocket(isCustomer);
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async createListNotificationBySchedule() {
        if (this.isCreateNotiFunctionRunning) {
            return // Hàm đang thực thi, từ chối thực hiện
        }
        
        try {
            this.isCreateNotiFunctionRunning = true

            const notificationSchedule = await this.notificationScheduleSystemService.getOneItem()

            if(notificationSchedule) {
                // Cap nhat lai notification schedule
                await this.notificationScheduleSystemService.updateIsCreated('vi', notificationSchedule._id)
                
                if (notificationSchedule.id_customer.length === 0 && notificationSchedule.id_group_customer.length === 0) {
                    await this.createForAllCustomer(notificationSchedule)
                }
    
                if (notificationSchedule.id_customer.length > 0) {
                    await this.createForListCustomer(notificationSchedule.id_customer, notificationSchedule)
                }
    
                if (notificationSchedule.is_id_collaborator) {
                    await this.createForListCollaborator(notificationSchedule)
                }
    
                if (notificationSchedule.id_group_customer.length > 0) {
                    await this.createForGroupCustomer(notificationSchedule.id_group_customer, notificationSchedule)
                }
            }
            
            return true
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        } finally {
            this.isCreateNotiFunctionRunning = false
        }
        
    }

    async createForAllCustomer(notificationSchedule) {
        try {

            let lstDeviceToken = await this.deviceTokenOopSystemService.getList([], TYPE_USER_OBJECT.customer)
            let lstIdCustomer = lstDeviceToken.map((e) => new Types.ObjectId(e.user_id))

            const getListCustomer = await this.customerOopSystemService.getListItemForPushNoti(lstIdCustomer)

            for (let i = 0; i < getListCustomer.length; i += LIMIT_NOTIFICATIONS) {
                let newListCustomer = getListCustomer.slice(i, i + LIMIT_NOTIFICATIONS)

                await this.notificationOopSystemService.createListNotification(newListCustomer, notificationSchedule, TYPE_USER_OBJECT.customer)

                // Tang thoi gian ban thong bao
                notificationSchedule.date_schedule = new Date(new Date(notificationSchedule.date_schedule).setSeconds(new Date(notificationSchedule.date_schedule).getSeconds() + PERIOD_NOTIFICATION_GENERATE)).toISOString()
            }

            return true
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async createForListCustomer(lstCustomer, notification) {
        try {
            const getListCustomer = await this.customerOopSystemService.getListItemForPushNoti(lstCustomer)

            for (let i = 0; i < getListCustomer.length; i += LIMIT_NOTIFICATIONS) {
                let newListCustomer = getListCustomer.slice(i, i + LIMIT_NOTIFICATIONS)

                await this.notificationOopSystemService.createListNotification(newListCustomer, notification, TYPE_USER_OBJECT.customer)

                // Tang thoi gian ban thong bao
                notification.date_schedule = new Date(new Date(notification.date_schedule).setSeconds(new Date(notification.date_schedule).getSeconds() + PERIOD_NOTIFICATION_GENERATE)).toISOString()
            }

            return true
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async createForListCollaborator(notification) {
        try {
            
            const query = {
                $and: [
                    {  is_delete: false },
                    {  is_locked: false },
                ]
            }
            const getListCollaborator = await this.collaboratorOopSystemService.getListItem(query)

            for (let i = 0; i < getListCollaborator.length; i += LIMIT_NOTIFICATIONS) {
                let newListCollaborator = getListCollaborator.slice(i, i + LIMIT_NOTIFICATIONS)

                await this.notificationOopSystemService.createListNotification(newListCollaborator, notification, TYPE_USER_OBJECT.collaborator)

                // Tang thoi gian ban thong bao
                notification.date_schedule = new Date(new Date(notification.date_schedule).setSeconds(new Date(notification.date_schedule).getSeconds() + PERIOD_NOTIFICATION_GENERATE)).toISOString()
            }

            return true
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async createForGroupCustomer(lstIdGroupCustomer, notification) {
        try {
            let lstDeviceToken = await this.deviceTokenOopSystemService.getList([], TYPE_USER_OBJECT.customer)
            let lstIdCustomer = lstDeviceToken.map((e) => new Types.ObjectId(e.user_id))

            const getListCustomer = await this.customerOopSystemService.getListItemForPushNoti(lstIdCustomer, lstIdGroupCustomer)

            for (let i = 0; i < getListCustomer.length; i += LIMIT_NOTIFICATIONS) {
                let newListCustomer = getListCustomer.slice(i, i + LIMIT_NOTIFICATIONS)

                await this.notificationOopSystemService.createListNotification(newListCustomer, notification, TYPE_USER_OBJECT.customer)

                // Tang thoi gian ban thong bao
                notification.date_schedule = new Date(new Date(notification.date_schedule).setSeconds(new Date(notification.date_schedule).getSeconds() + PERIOD_NOTIFICATION_GENERATE)).toISOString()
            }

            return true
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async deleteManyNotificationSchedule() {
        try {
            await this.notificationOopSystemService.deleteManyNotificationSchedule()
            return true
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async sendNotificationScheduleForCustomer() {
        if(this.isSendNotiFunctionRunning) {
            return
        }
        try {            
            this.isSendNotiFunctionRunning = true
            const result = await this.getListForPushNotification(true)

            if (result?.data.length > 0)  {
                // 2. Map danh sach thong bao
                const notifcationMap: Map<string, any> = new Map(result.data.map((notification) => [notification.id_customer.toString(), notification]))

                //  3. Lay danh sách id_customer
                const lstIdCustomer = result.data.map((n:any) => n.id_customer)

                const lstCustomer = await this.customerOopSystemService.getListItemForPushNoti(lstIdCustomer)

                if (lstCustomer.length > 0) {
                    // 4. Chia danh sach khach hang ra ban thong bao
                    for (let i = 0; i < lstCustomer.length; i += LIMIT_USERS) {
                        let newLstCustomer = lstCustomer.slice(i, i + LIMIT_USERS)
                        await this.pushNotificationSystemService.sendAndUpdateNotificationUsingSocket(newLstCustomer, notifcationMap, TYPE_SERVER_GATEWAY.customer)
                    }
                }
            }

            return true
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        } finally{
            this.isSendNotiFunctionRunning = false
        }
    }

    async sendNotificationScheduleForCollaborator() {
        if(this.isSendNotiFuncRunningForCollaborator) {
            return
        }
        try {
            this.isSendNotiFuncRunningForCollaborator = true
            const result = await this.getListForPushNotification(false)

            if (result?.data.length > 0)  {
                // 2. Map danh sach thong bao
                const notifcationMap: Map<string, any> = new Map(result.data.map((notification) => [notification.id_collaborator.toString(), notification]))

                //  3. Lay danh sách id_collaborator
                const lstIdCollaborator = result.data.map((n:any) => n.id_collaborator)

                const query = {
                    $and: [
                        {_id: { $in: lstIdCollaborator }}
                    ]
                }

                const lstCollaborator = await this.collaboratorOopSystemService.getListItem(query)

                if(lstCollaborator.length > 0) {
                    // 4. Chia danh sach khach hang ra ban thong bao
                    for(let i = 0; i < lstCollaborator.length; i += LIMIT_USERS) {
                        let newLstCollaborator = lstCollaborator.slice(i, i + LIMIT_USERS)
                        await this.pushNotificationSystemService.sendAndUpdateNotificationUsingSocket(newLstCollaborator, notifcationMap, TYPE_SERVER_GATEWAY.collaborator)
                    }
                }
            }

            return true
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        } finally{
            this.isSendNotiFuncRunningForCollaborator = false
        }
    }

    async cancelGroupOrder(lang, subjectAction, subjectSendNoti, groupOrder, order, minute, isPaymentFail: boolean = false, isExpired: boolean = false) {
        try {
            const notification = await this.notificationOopSystemService.cancelGroupOrder(subjectAction, subjectSendNoti, groupOrder, order, minute, isPaymentFail, isExpired)

            if(subjectSendNoti.type === "customer") {
                // Ban thong bao
                await this.pushNotificationSystemService.sendNotificationUsingSocket(lang, TYPE_SERVER_GATEWAY.customer, subjectSendNoti.customer.session_socket, notification)
            }
            
            if(subjectSendNoti.type === "collaborator") {
                // Ban thong bao
                await this.pushNotificationSystemService.sendNotificationUsingSocket(lang, TYPE_SERVER_GATEWAY.collaborator, subjectSendNoti.collaborator.session_socket, notification)
            }

            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async cancelOrderV2(lang, typeSubject, reasonCancel, groupOrder, order, customer, collaborator?) {
        try {

            const dateWork = new Date(order.date_work).getTime();
            const dateNow = new Date().getTime();
            const minute = (dateWork - dateNow) / 60000;

            let payloadNotiCustom = {
                title: {
                    en: "GUVI",
                    vi: "GUVI"
                },
                body: {
                    en: "",
                    vi: ""
                },
                user_object: "customer",
                id_customer: order.id_customer,
                type_notification: "activity",
                id_order: order._id,
                is_push_notification: true,
                is_notification: true
            }

            let payloadNotiCollaborator = {
                title: {
                    en: "GUVI Partner",
                    vi: "GUVI Partner"
                },
                body: {
                    vi: `Ca làm ${order.id_view} đã bị hủy`,
                    en: `Your shift ${order.id_view} is canceled`
                },
                user_object: "collaborator",
                id_collaborator: order.id_collaborator || null,
                type_notification: "activity",
                id_order: order._id,
                id_group_order: groupOrder._id,
                is_push_notification: true,
                is_notification: true
            }

            if(collaborator && typeSubject === 'collaborator') {
                payloadNotiCustom.body = {
                    vi: `Oops, CTV "${collaborator.full_name}" đã hủy công việc ${order.id_view} của bạn. GUVI sẽ kiểm tra và xử lý vi phạm không được phép của CTV. Bạn hãy liên hệ hotline 1900.0027 để được hỗ trợ.`,
                    en: `Oops, Collaborator "${collaborator.full_name}" canceled your job ${order.id_view}. GUVI will check and handle unauthorized violations by collaborators. Please contact hotline 1900.0027 for support.`
                }
            }
            else if(typeSubject === 'customer') {
                // payloadNotiCollaborator.id_collaborator = collaborator?._id || null;

                const viewTypeWork = (groupOrder.type === "schedule") ? `gói dịch vụ ${groupOrder.id_view}` : `công việc ${order.id_view}`
                payloadNotiCustom.body = {
                    vi: `Bạn đã hủy ${viewTypeWork} với lý do "${reasonCancel.title.vi}".\n Nếu bạn cần hỗ trợ, vào "Tài khoản", chọn "Góp ý". Chúng tôi sẽ lắng nghe vấn đề của bạn và liên hệ lại bạn ngay khi nhận thông tin.`,
                    en: `You canceled ${viewTypeWork} with reason "${reasonCancel.title.en}".\n If you need support, enter "Account" click "Feedback". We always listen for you problem and contact you as soon as we receive the information.`
                }

            } else if(typeSubject === 'admin') {
                // payloadNotiCollaborator.id_collaborator = collaborator?._id || null;               
                payloadNotiCustom.body = {
                    vi: `Đơn ${order.id_view} đã được hủy. Hãy thử đặt lại vào một khung giờ khác thử xem nhé!`,
                    en: `Your order ${order.id_view} has been cancelled. Try resetting for another time frame and see!`
                }
            } else if(typeSubject === 'system') {
                payloadNotiCustom.body = {
                    vi: `Hiện tại, tất cả "Cộng tác viên" đều đang bận hoặc chưa thể nhận công việc của bạn. Hãy thử đặt lại vào một khung giờ khác thử xem nhé!\nĐơn ${order.id_view} đã được hủy tự động, bạn không cần phải làm gì cả.`,
                    en: `Currently, all "Collaborators" are busy or cannot accept your shift. Please try again at another time!\nOrder ${order.id_view} has been canceled automatically, you do not need to do anything.`
                }
            } 

            const notificationForCustomer = await this.notificationOopSystemService.createItem(payloadNotiCustom);
            // Ban thong bao
            await this.pushNotificationSystemService.sendNotificationUsingSocket(lang, TYPE_SERVER_GATEWAY.customer, customer.session_socket, notificationForCustomer)
            if(payloadNotiCollaborator.id_collaborator !== null) {
                const notificationForCustomer = await this.notificationOopSystemService.createItem(payloadNotiCollaborator);
                // Ban thong bao
                await this.pushNotificationSystemService.sendNotificationUsingSocket(lang, TYPE_SERVER_GATEWAY.customer, collaborator.session_socket, notificationForCustomer)
            }
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateFailStatusForManyNotiUsingFirebase() {
        try {
            return await this.notificationOopSystemService.updateFailStatusForManyNotiUsingFirebase()
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async applyReferralCode(lang, inviter, customer, isCustomer) {
        try {
            let payloadNoti = {
                title: {
                    vi: "GUVI",
                    en: "GUVI"
                },
                body: {
                    vi: `Người bạn "${customer.full_name}" đã nhập mã giới thiệu của bạn. Chỉ một bước đặt đơn nữa thôi bạn sẽ nhận được phần thưởng từ GUVI.\n Cùng tải app, cùng chung vui !!! Nhấn đây để xem chi tiết.`,
                    en: `Your friend "${customer.full_name}" has entered your referral code. Just one more step to place an order and you will receive a reward from GUVI.\n Download the app and have fun together!!! Click here to see details.`
                },
                user_object: isCustomer ? TYPE_USER_OBJECT.customer : TYPE_USER_OBJECT.collaborator,
                id_customer: isCustomer ? inviter._id : null,
                type_notification: TYPE_NOTIFICATION.activity,
                id_collaborator: !isCustomer ? inviter._id : null,
                is_push_notification: true,
                is_notification: true
            }

            // Tao thong bao
            const notification = await this.notificationOopSystemService.createItem(payloadNoti);
            // Ban thong bao
            if (isCustomer) {
                await this.pushNotificationSystemService.sendNotificationUsingSocket(lang, TYPE_SERVER_GATEWAY.customer, inviter.session_socket, notification)
            } else {
                await this.pushNotificationSystemService.sendNotificationUsingSocket(lang, TYPE_SERVER_GATEWAY.collaborator, inviter.session_socket, notification)
            }
            
            return true
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async addMoneyIntoWorkWallet(lang, collaborator, inviter, money) {
        try {
            const formatMoney = await this.generalHandleService.formatMoney(money);
            
            let payloadNotiInviter = {
                title: {
                    en: `You are given ${formatMoney}`,
                    vi: `Bạn được tặng ${formatMoney}`
                },
                body: {
                    en: `${collaborator.full_name} done 3 jobs with good review`,
                vi: `${collaborator.full_name} đã hoàn thành 3 ca làm được đánh giá tốt`
                },
                user_object: TYPE_USER_OBJECT.collaborator,
                id_collaborator: inviter._id,
                type_notification: TYPE_NOTIFICATION.activity,
                is_push_notification: true,
                is_notification: true
            }

            const notification =  await this.notificationOopSystemService.createItem(payloadNotiInviter);
                // Ban thong bao
                await this.pushNotificationSystemService.sendNotificationUsingSocket(lang, TYPE_SERVER_GATEWAY.collaborator, inviter.session_socket, notification)

            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async addMoneyIntoWorkWalletNew(lang, collaborator, inviter, money, isCustomer) {
        try {
            const formatMoney = await this.generalHandleService.formatMoney(money);
            
            let payloadNotiInviter = {
                title: {
                    en: `You are given ${formatMoney}`,
                    vi: `Bạn được tặng ${formatMoney}`
                },
                body: {
                    en: `${collaborator.full_name} has completed at least 5 shifts and has 3 good reviews of 4 stars or higher`,
                    vi: `${collaborator.full_name} đã hoàn thành ít nhất 5 ca làm và có 3 đánh giá tốt từ 4 sao trở lên`
                },
                user_object: TYPE_USER_OBJECT.collaborator,
                id_collaborator: inviter._id,
                type_notification: TYPE_NOTIFICATION.activity,
                is_push_notification: true,
                is_notification: true
            }

            let typeServerGateway = isCustomer ? TYPE_SERVER_GATEWAY.customer : TYPE_SERVER_GATEWAY.collaborator

            const notification =  await this.notificationOopSystemService.createItem(payloadNotiInviter);
                // Ban thong bao
                await this.pushNotificationSystemService.sendNotificationUsingSocket(lang, typeServerGateway, inviter.session_socket, notification)

            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    async verifyCollaborator(lang, collaborator) {
        try {
            let payloadNoti = {
                title: {
                    en: `Approved successfully`,
                    vi: `Phê duyệt thành công`,
                },
                body: {
                    en: `Your account has been approved`,
                    vi: `Bạn đã được phê duyệt tài khoản của mình`,
                },
                user_object: TYPE_USER_OBJECT.collaborator,
                id_collaborator: collaborator._id,
                type_notification: TYPE_NOTIFICATION.activity,
                is_push_notification: true,
                is_notification: true
            }

            const notification =  await this.notificationOopSystemService.createItem(payloadNoti);

            // Ban thong bao
            await this.pushNotificationSystemService.sendNotificationUsingSocket(lang, TYPE_SERVER_GATEWAY.collaborator, collaborator.session_socket, notification)

            return notification
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async verifyTopUpCustomer(lang, transaction, customer) {
        try {
            const formatMoney = await this.generalHandleService.formatMoney(transaction.money)

            const payloadNoti = {
                title: {
                    vi: "Nạp tiền vào tài khoản thành công !!!",
                    en: `Successfully top up into the account !!!`,
                },
                body: {
                    vi: `Tài khoản của bạn đã nạp ${formatMoney} thành công !!!`,
                    en: `Your account has successfully top up ${formatMoney} !!!`
                },
                user_object: TYPE_USER_OBJECT.customer,
                id_customer: customer._id,
                type_notification: TYPE_NOTIFICATION.activity,
                is_push_notification: true,
                is_notification: true
            }

            // Tao thong bao
            const notificationForCustomer =  await this.notificationOopSystemService.createItem(payloadNoti);
            // Ban thong bao
            await this.pushNotificationSystemService.sendNotificationUsingSocket(lang, TYPE_SERVER_GATEWAY.customer, customer.session_socket, notificationForCustomer)

            return true
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async changeCollaborator(lang, payloadDependency) {
        try {
            const order = payloadDependency.order
            const collaborator = payloadDependency.collaborator
            const customer = payloadDependency.customer

            let payloadNoti = {
                title: {
                    en: "GUVI",
                    vi: "GUVI"
                },
                body: {
                    vi: `"Cộng tác viên" của đơn ${order.id_view} đã được thay đổi. Chúng tôi đang thay đổi "Cộng tác viên ${collaborator.full_name}".
                    Nhấn đây để kiểm tra lại thông tin nhé !!!`,
                    en: `The "Collaborator" of the order ${order.id_view} has been changed. We are changing "Collaborator ${collaborator.full_name}".
                    Click here to check the information again!!!`
                },
                user_object: TYPE_USER_OBJECT.collaborator,
                id_customer: order.id_customer || null,
                type_notification: TYPE_NOTIFICATION.activity,
                id_order: order._id,
                id_group_order: order.id_group_order,
                is_push_notification: true,
                is_notification: true
            }

            const notification =  await this.notificationOopSystemService.createItem(payloadNoti);

             // Ban thong bao
            await this.pushNotificationSystemService.sendNotificationUsingSocket(lang, TYPE_SERVER_GATEWAY.customer, customer.session_socket, notification)

            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async testNoti(lang, subjectAction, payloadDependency, getCustomer, idChanel) {
        try {

            let payloadNotiCustom = {
                title: {
                    en: `GUVI`,
                    vi: `GUVI`,
                },
                body: {
                    en: `GUVI is looking for "Collaborators" for you. Click to see details.`,
                    vi: `GUVI đang tìm kiếm "Cộng tác viên" cho bạn. Nhấp để xem chi tiết.`,
                },
                user_object: TYPE_USER_OBJECT.customer,
                id_customer: payloadDependency?.customer?._id || null,
                type_notification: TYPE_NOTIFICATION.activity,
                // id_order: payloadDependency?.order?._id,
                is_push_notification: true,
                is_notification: true
            }

            const notification =  await this.notificationOopSystemService.createItem(payloadNotiCustom, true);

            // Ban thong bao
            if(idChanel === "sendNotificationToClient") {
                await this.pushNotificationSystemService.sendNotificationUsingSocket(lang, TYPE_SERVER_GATEWAY.customer, getCustomer.session_socket, notification)
            }
            if(idChanel === "sendMarketingNotificationToClient") {
                await this.pushNotificationSystemService.sendMarketingNotificationUsingSocket(lang, TYPE_SERVER_GATEWAY.customer, getCustomer.session_socket, notification)
            }
            // await this.pushNotificationSystemService.sendNotificationUsingSocket(lang, TYPE_SERVER_GATEWAY.customer, getCustomer.session_socket, notification)
            // const getGroupOrder = payloadDependency.group_order;
            // const itemId = []
            // let getList = []
            // if(getGroupOrder.id_favourite_collaborator.length > 0) {
            //     getList = await this.collaboratorOopSystemService.getCollaboratorFavourite(getGroupOrder);
            // } else {
            //     getList = await this.collaboratorOopSystemService.getCollaboratorForGroupOrder(getGroupOrder);                
            // }

            return true
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async minusRemainingShiftDeposit(lang, idGroupOrder, order, collaborator, remainingShiftDeposit) {
        try {
            const formatRemainingShiftDeposit = await this.generalHandleService.formatMoney(remainingShiftDeposit);

            let payloadNotiMinusPlatformFee = {
                title: {
                    vi: `Cấn trừ số tiền thu hộ còn lại của ca làm ${order.id_view}`,
                    en: `Deducting the remaining collected amount of the order ${order.id_view}`,
                },
                body: {
                    vi: `Bạn đã bị trừ ${formatRemainingShiftDeposit} phí thu hộ của ca làm ${order.id_view} trong Ví CTV.`,
                    en: `You have been deducted ${formatRemainingShiftDeposit} as the collection fee for order ${order.id_view} from your collaborator Wallet.`
                },
                user_object: TYPE_USER_OBJECT.collaborator,
                id_collaborator: collaborator._id || null,
                type_notification: TYPE_NOTIFICATION.activity,
                id_order: order._id,
                id_group_order: idGroupOrder,
                is_push_notification: true,
                is_notification: true
            }

            const notification =  await this.notificationOopSystemService.createItem(payloadNotiMinusPlatformFee);

             // Ban thong bao
            await this.pushNotificationSystemService.sendNotificationUsingSocket(lang, TYPE_SERVER_GATEWAY.collaborator, collaborator.session_socket, notification)

            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async notHaveEnoughBalance(lang, customer) {
        try {
            let payloadNotiCustomer = {
                title: {
                    en: `Your account does not have enough balance`,
                    vi: `Tài khoản của bạn không đủ số dư`
                },
                body: {
                    en: `Your account does not have enough balance to continue creating repeated orders.`,
                    vi: `Tài khoản của bạn không đủ số dư để tiếp tục tạo đơn hàng lặp lại.`
                },
                user_object: TYPE_USER_OBJECT.customer,
                id_customer: customer._id,
                type_notification: TYPE_NOTIFICATION.activity,
                is_push_notification: true,
                is_notification: true
            }

            // Tao thong bao
            const notification = await this.notificationOopSystemService.createItem(payloadNotiCustomer);
            // Ban thong bao
            await this.pushNotificationSystemService.sendNotificationUsingSocket(lang, TYPE_SERVER_GATEWAY.customer, customer.session_socket, notification)
            return true
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async fineCollaborator(lang, contentNotification, collaborator) {
        try {
            let payloadNoti = {
                title: {
                    vi: contentNotification.title.vi,
                    en: contentNotification.title.en
                },
                body: {
                    vi: contentNotification.description.vi,
                    en: contentNotification.description.en,
                },
                user_object: TYPE_USER_OBJECT.collaborator,
                id_collaborator: collaborator._id,
                type_notification: TYPE_NOTIFICATION.activity,
                is_push_notification: true,
                is_notification: true
            }

            const notification =  await this.notificationOopSystemService.createItem(payloadNoti);
            await this.pushNotificationSystemService.sendNotificationUsingSocket(lang, TYPE_SERVER_GATEWAY.collaborator, collaborator.session_socket, notification)

            return payloadNoti;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async fineCollaboratorWithMoney(lang, contentNotification, money, collaborator) {
        try {
            const payloadContent = {
                punish_money: await this.generalHandleService.formatMoney(money || 0)
            }
            let payloadNoti = {
                title: {
                    vi: contentNotification.title.vi,
                    en: contentNotification.title.en
                },
                body: {
                    vi: await this.generalHandleService.convertTemplateLiteral(payloadContent, contentNotification.description.vi),
                    en: await this.generalHandleService.convertTemplateLiteral(payloadContent, contentNotification.description.en)
                },
                user_object: TYPE_USER_OBJECT.collaborator,
                id_collaborator: collaborator._id,
                type_notification: TYPE_NOTIFICATION.activity,
                is_push_notification: true,
                is_notification: true
            }

            const notification =  await this.notificationOopSystemService.createItem(payloadNoti);
            await this.pushNotificationSystemService.sendNotificationUsingSocket(lang, TYPE_SERVER_GATEWAY.collaborator, collaborator.session_socket, notification)

            return payloadNoti;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async addRewardPoint(lang, contentNotification, collaborator) {
        try {
            let payloadNoti = {
                title: {
                    vi: contentNotification.title.vi,
                    en: contentNotification.title.en
                },
                body: {
                    vi: contentNotification.description.vi,
                    en: contentNotification.description.en,
                },
                user_object: TYPE_USER_OBJECT.collaborator,
                id_collaborator: collaborator._id,
                type_notification: TYPE_NOTIFICATION.activity,
                is_push_notification: true,
                is_notification: true
            }

            const notification =  await this.notificationOopSystemService.createItem(payloadNoti);
            await this.pushNotificationSystemService.sendNotificationUsingSocket(lang, TYPE_SERVER_GATEWAY.collaborator, collaborator.session_socket, notification)

            return payloadNoti;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async addRewardMoney(lang, contentNotification, money, collaborator, score) {
        try {
            const payloadContent = {
                reward_value: await this.generalHandleService.formatMoney(money || 0),
                score: score
            }
            let payloadNoti = {
                title: {
                    vi: contentNotification.title.vi,
                    en: contentNotification.title.en
                },
                body: {
                    vi: await this.generalHandleService.convertTemplateLiteral(payloadContent, contentNotification.description.vi),
                    en: await this.generalHandleService.convertTemplateLiteral(payloadContent, contentNotification.description.en)
                },
                user_object: TYPE_USER_OBJECT.collaborator,
                id_collaborator: collaborator._id,
                type_notification: TYPE_NOTIFICATION.activity,
                is_push_notification: true,
                is_notification: true
            }

            const notification =  await this.notificationOopSystemService.createItem(payloadNoti);
            await this.pushNotificationSystemService.sendNotificationUsingSocket(lang, TYPE_SERVER_GATEWAY.collaborator, collaborator.session_socket, notification)

            return payloadNoti;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async revokeRewardMoney(lang, money, collaborator, type_wallet) {
        try {
            const formatMoney = await this.generalHandleService.formatMoney(money);
            
            let payloadNoti = {
                title: {
                    vi: 'Hệ thống thu hồi phiếu thưởng',
                    en: 'Reward ticket recovery system'
                },
                body: {
                    vi: `Hệ thống thu hồi phiếu thưởng, thu hồi ${formatMoney} từ ví ${type_wallet === TYPE_WALLET.collaborator_wallet ? 'CTV' : 'Nạp'}`,
                    en: `Reward ticket recovery system, deducting ${formatMoney} from ${type_wallet === TYPE_WALLET.collaborator_wallet ? 'Collaborator Wallet' : 'Work Wallet'}`,
                },
                user_object: TYPE_USER_OBJECT.collaborator,
                id_collaborator: collaborator._id,
                type_notification: TYPE_NOTIFICATION.activity,
                is_push_notification: true,
                is_notification: true
            }

            const notification =  await this.notificationOopSystemService.createItem(payloadNoti);
            await this.pushNotificationSystemService.sendNotificationUsingSocket(lang, TYPE_SERVER_GATEWAY.collaborator, collaborator.session_socket, notification)

            return payloadNoti;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async revokeRewardPoint(lang, point, collaborator) {
        try {
            let payloadNoti = {
                title: {
                    vi: 'Hệ thống thu hồi phiếu thưởng',
                    en: 'Reward ticket recovery system'
                },
                body: {
                    vi: `Hệ thống thu hồi phiếu thưởng, thu hồi ${point} điểm từ tổng điểm tích lũy`,
                    en: `Reward ticket recovery system, deducting ${point} points from the total accumulated points`,
                },
                user_object: TYPE_USER_OBJECT.collaborator,
                id_collaborator: collaborator._id,
                type_notification: TYPE_NOTIFICATION.activity,
                is_push_notification: true,
                is_notification: true
            }

            const notification =  await this.notificationOopSystemService.createItem(payloadNoti);
            await this.pushNotificationSystemService.sendNotificationUsingSocket(lang, TYPE_SERVER_GATEWAY.collaborator, collaborator.session_socket, notification)

            return payloadNoti;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
