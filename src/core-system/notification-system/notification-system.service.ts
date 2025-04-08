import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Collaborator, Customer } from 'src/@core'
import { Notification, NotificationDocument } from 'src/@core/db/schema/notification.schema'
import { createNotificationDTOAdmin } from 'src/@core/dto/notification.dto'
import { TYPE_USER_OBJECT } from 'src/@repositories/module/mongodb/@database/enum/base.enum'
import { DeviceTokenRepositoryService } from 'src/@repositories/repository-service/device-token-repository/device-token-repository.service'
import { NotificationRepositoryService } from 'src/@repositories/repository-service/notification-repository/notification-repository.service'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service'
import { PushNotificationService } from 'src/@share-module/push-notification/push-notification.service'

@Injectable()
export class NotificationSystemService {
    constructor(
        private customExceptionService: CustomExceptionService,

        private deviceTokenRepositoryService: DeviceTokenRepositoryService,

        private notificationRepositoryService: NotificationRepositoryService,

        private pushNotificationService: PushNotificationService,

        private generalHandleService: GeneralHandleService,
        // private dasd: notificationrepos

        @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
        @InjectModel(Customer.name) private customerModel: Model<NotificationDocument>,
        @InjectModel(Collaborator.name) private collaboratorModel: Model<NotificationDocument>,
    ) { }

    async newActivity(payload: createNotificationDTOAdmin) {
        try {
            const newItem = new this.notificationModel({
                title: payload.title,
                description: payload.description,
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
            });
            newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }


    async createItem(payload) {
        try {
            const newItem = await this.notificationRepositoryService.create({
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
            })

            if(payload.is_push_notification === true) {
                await this.sendPushNotification("vi", newItem)
            }

            return true;
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
            console.log(err, 'err');
            
            throw new HttpException(err.response || err.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    sendManyUserPushNotification(lang, arrIdUser) {
        try {
            
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }



    // cancelOrderNotification() {
    //     try {
    //         const title = {
    //             en: ``,
    //             vi: ``
    //         }
    //         const payload = {
    //             title
    //         }

    //         this.createItem(payload);
    //         return true;
    //     } catch(err) {
    //         throw new HttpException(err.response || err.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
    //     }
    // }








    async cancelOrder(typeSubject, reasonCancel, groupOrder, order, collaborator?) {
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

            this.createItem(payloadNotiCustom);

            if(payloadNotiCollaborator.id_collaborator !== null) {
                this.createItem(payloadNotiCollaborator);
            }
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    async unAssignCollaborator(typeSubject, findGroupOrder, collaborator, orderCancel) {
        try {
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
                id_customer: orderCancel.id_customer,
                type_notification: "activity",
                id_order: orderCancel._id,
                is_push_notification: true,
                id_group_order: findGroupOrder._id,
                is_notification: true
            }

            let payloadNotiCollaborator = {
                title: {
                    en: "GUVI Partner",
                    vi: "GUVI Partner"
                },
                body: {
                    vi: `Ca làm ${orderCancel.id_view} đã bị hủy`,
                    en: `Your shift ${orderCancel.id_view} is canceled`
                },
                user_object: "collaborator",
                id_collaborator: null,
                type_notification: "activity",
                id_order: orderCancel._id,
                // id_group_order: groupOrder._id,
                is_push_notification: true,
                is_notification: true
            }

            if(typeSubject === 'collaborator') {
                payloadNotiCollaborator.id_collaborator = collaborator._id

                payloadNotiCollaborator.body = {
                    en: `✅ Bạn đã "Hủy" ca làm ${orderCancel.id_view}`,
                    vi: `✅ You have "Canceled" your shift ${orderCancel.id_view}`
                }
                payloadNotiCustom.body = {
                    vi: `Oops, CTV "${collaborator.full_name}" đã hủy công việc ${findGroupOrder.id_view} của bạn. Đừng lo, GUVI đang tìm kiếm "Cộng tác viên" mới cho bạn. Hoặc liên hệ hotline 1900.0027 để được hỗ trợ ngay nhé.`,
                    en: `Oops, Collaborator "${collaborator.full_name}" canceled your job ${findGroupOrder.id_view}. Don't worry, GUVI is looking for new "Collaborators" for you. Or contact hotline 1900.0027 for immediate support.`
                }
            } else if(typeSubject === 'admin') {
                payloadNotiCollaborator.id_collaborator = collaborator?._id || null;
                payloadNotiCustom.body = {
                    vi: `GUVI đang tìm người thay thế cho công việc ${findGroupOrder.id_view} của bạn, hãy yên tâm nhé, GUVI luôn sẵn sàng hỗ trợ bạn.`,
                    en: `GUVI is looking for a replacement for your job ${findGroupOrder.id_view}, rest assured, GUVI is always ready to support you.`
                }
                // payloadNotiCollaborator.body = {
                //     vi: `QTV đã hỗ trợ ${findGroupOrder.id_view} của bạn, hãy yên tâm nhé, GUVI luôn sẵn sàng hỗ trợ bạn.`,
                //     en: `GUVI is looking for a replacement for your job ${findGroupOrder.id_view}, rest assured, GUVI is always ready to support you.`
                // }
            }

            
            if(typeSubject === 'collaborator') {
                this.createItem(payloadNotiCustom);
                this.createItem(payloadNotiCollaborator)
            }
            if(typeSubject === "admin") {
                this.createItem(payloadNotiCustom)
            }

            return true;
        } catch (err) {
            console.log(err, 'err');
            
            throw new HttpException(err.response || err.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    // async cancelGroupOrder(typeSubject, reasonCancel, groupOrder, collaborator) {
    //     try {
    //         const dateWork = new Date(groupOrder.date_work).getTime();
    //         const dateNow = new Date().getTime();
    //         const minute = (dateWork - dateNow) / 60000;

    //         let payloadNotiCustom = {
    //             title: {
    //                 en: "GUVI",
    //                 vi: "GUVI"
    //             },
    //             body: {
    //                 en: "",
    //                 vi: ""
    //             },
    //             user_object: "customer",
    //             id_customer: groupOrder.id_customer,
    //             type_notification: "activity",
    //             // id_order: order._id,
    //             is_push_notification: true,
    //             is_notification: true
    //         }

    //         let payloadNotiCollaborator = {
    //             title: {
    //                 en: "GUVI Partner",
    //                 vi: "GUVI Partner"
    //             },
    //             body: {
    //                 en: `Dịch vụ ${groupOrder.id_view} đã bị hủy`,
    //                 vi: `Service ${groupOrder.id_view} is canceled`
    //             },
    //             user_object: "collaborator",
    //             id_collaborator: null,
    //             type_notification: "activity",
    //             id_order: order._id,
    //             id_group_order: groupOrder._id,
    //             is_push_notification: true,
    //             is_notification: true
    //         }



    //         if(typeSubject === 'collaborator') {
    //             payloadNotiCollaborator.id_collaborator = collaborator._id

    //             payloadNotiCollaborator.body = {
    //                 en: `✅ Bạn đã "Hủy" ca làm ${order.id_view}`,
    //                 vi: `✅ You have "Canceled" your shift ${order.id_view}`
    //             }

    //             if (minute > 60) {
    //                 payloadNotiCustom.body = {
    //                     vi: `Oops, CTV "${collaborator.full_name}" đã hủy công việc ${order.id_view} của bạn. Đừng lo, GUVI đang tìm kiếm "Cộng tác viên" mới cho bạn.`,
    //                     en: `Oops, Collaborator "${collaborator.full_name}" canceled your job ${order.id_view}. Don't worry, GUVI is looking for new "Collaborators" for you.`
    //                 }
    //             } else if (minute > 30 && minute < 60) {
    //                 payloadNotiCustom.body = {
    //                     vi: `Oops, CTV "${collaborator.full_name}" đã hủy công việc ${order.id_view} của bạn. Đừng lo, GUVI đang tìm kiếm "Cộng tác viên" mới cho bạn. Hoặc liên hệ hotline 1900.0027 để được hỗ trợ ngay nhé.`,
    //                     en: `Oops, Collaborator "${collaborator.full_name}" canceled your job ${order.id_view}. Don't worry, GUVI is looking for new "Collaborators" for you. Or contact hotline 1900.0027 for immediate support.`
    //                 }
    //             } else {
    //                 payloadNotiCustom.body = {
    //                     vi: `Oops, CTV "${collaborator.full_name}" đã hủy công việc ${order.id_view} của bạn. GUVI sẽ kiểm tra và xử lý vi phạm không được phép của CTV. Bạn hãy liên hệ hotline 1900.0027 để được hỗ trợ.`,
    //                     en: `Oops, Collaborator "${collaborator.full_name}" canceled your job ${order.id_view}. GUVI will check and handle unauthorized violations by collaborators. Please contact hotline 1900.0027 for support.`
    //                 }
    //             }
    //         } else if(typeSubject === 'customer') {
    //             payloadNotiCollaborator.id_collaborator = collaborator?._id || null;
    //             const 
    //             payloadNotiCustom.body = {
    //                 vi: `Bạn đã hủy gói dịch vụ ${groupOrder.id_view} với lý do "${reasonCancel.title.vi}".\n Nếu bạn cần hỗ trợ, vào "Tài khoản", chọn "Góp ý". Chúng tôi sẽ lắng nghe vấn đề của bạn và liên hệ lại bạn ngay khi nhận thông tin.`,
    //                 en: `You canceled order ${groupOrder.id_view} with reason "${reasonCancel.title.en}".\n If you need support, enter "Account" click "Feedback". We always listen for you problem and contact you as soon as we receive the information.`
    //             }

    //         } else if(typeSubject === 'admin') {
    //             payloadNotiCollaborator.id_collaborator = collaborator?._id || null;
    //         } else if(typeSubject === 'system') {
    //             payloadNotiCustom.body = {
    //                 vi: `Hiện tại, tất cả "Cộng tác viên" đều đang bận hoặc chưa thể nhận ca làm của bạn. Hãy thử đặt lại vào một khung giờ khác thử xem nhé!\nĐơn ${groupOrder.id_view} đã được hủy tự động, bạn không cần phải làm gì cả.`,
    //                 en: `Currently, all "Collaborators" are busy or cannot accept your shift. Please try again at another time!\nOrder ${groupOrder.id_view} has been canceled automatically, you do not need to do anything.`
    //             }
    //         } 

    //         this.createItem(payloadNotiCustom);
    //         if(payloadNotiCollaborator.id_collaborator !== null) {
    //             this.createItem(payloadNotiCollaborator);
    //         }

    //         return true;
    //     } catch (err) {
    //         throw new HttpException(err.response || err.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
    //     }
    // }


    async refundCollaborator(subjectAction, payloadDependency, money, getOrder) {
        try {
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
                id_group_order: payloadDependency.id_group_order,
                is_push_notification: true,
                is_notification: true
            }
            this.createItem(payloadNotiCollaborator);
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async refundCustomer(subjectAction, payloadDependency, money, getGroupOrder, getOrder?) {
        try {
            const formatMoney = await this.generalHandleService.formatMoney(money)
            let payloadNotiCustomer = {
                title: {
                    vi: "Hoàn tiền thành công !",
                    en: "Refund success !"
                },
                body: {
                    vi: `Bạn đã được hoàn ${formatMoney} vào ví Gpay do đơn ${getGroupOrder.id_view} bị hủy.`,
                    en: `You have received a refund of ${formatMoney} to your Gpay wallet because order ${getGroupOrder.id_view} was canceled.`
                },
                user_object: "customer",
                id_customer: getOrder.id_customer,
                type_notification: "activity",
                id_order: (getOrder) ? getOrder._id : null,
                id_group_order: getGroupOrder._id,
                is_push_notification: true,
                is_notification: true
            }
            if(getOrder) {
                payloadNotiCustomer.body = {
                    en: `Bạn đã được hoàn ${formatMoney} vào ví Gpay do đơn ${getOrder.id_view} bị hủy.`,
                    vi: `You have received a refund of ${formatMoney} to your Gpay wallet because order ${getOrder.id_view} was canceled.`
                }
            }
            this.createItem(payloadNotiCustomer);
            return true;
        } catch(err){
            throw new HttpException(err.response || err.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async confirmOrder(groupOrder, order, collaborator) {
        try {
            const dateWork = new Date(order.date_work).getTime();
            const dateNow = new Date().getTime();
            const minute = (dateWork - dateNow) / 60000;

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
                type_notification: "activity",
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
                user_object: "collaborator",
                id_collaborator: collaborator._id || null,
                type_notification: "activity",
                id_order: order._id,
                id_group_order: groupOrder._id,
                is_push_notification: true,
                is_notification: true
            }

            this.createItem(payloadNotiCustom);

            if(payloadNotiCollaborator.id_collaborator !== null) {
                this.createItem(payloadNotiCollaborator);
            }

            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}