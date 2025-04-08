import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Collaborator, CollaboratorDocument, Customer, CustomerDocument, DeviceToken, DeviceTokenDocument, MILLISECOND_IN_HOUR, Order, OrderDocument, Service, ServiceDocument, TransitionCollaboratorDocument, UserSystem, UserSystemDocument, previousBalanceCollaboratorDTO } from 'src/@core'
import { ExamTestDocument } from 'src/@core/db/schema/examtest_collaborator.schema'
import { GroupOrder, GroupOrderDocument } from 'src/@core/db/schema/group_order.schema'
import { HistoryActivity, HistoryActivityDocument } from 'src/@core/db/schema/history_activity.schema'
import { HistoryOrder, HistoryOrderDocument } from 'src/@core/db/schema/history_order.schema'
import { InfoTestCollaborator } from 'src/@core/db/schema/info_test_collaborator.schema'
import { ReasonCancel, ReasonCancelDocument } from 'src/@core/db/schema/reason_cancel.schema'
import { CollaboratorRepositoryService } from 'src/@repositories/repository-service/collaborator-repository/collaborator-repository.service'
import { CustomerRepositoryService } from 'src/@repositories/repository-service/customer-repository/customer-repository.service'
import { HistoryActivityRepositoryService } from 'src/@repositories/repository-service/history-activity-repository/history-activity-repository.service'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service'
import { NotificationService } from 'src/notification/notification.service'
import { Promotion, PromotionDocument } from '../../@core/db/schema/promotion.schema'
import { NotificationSystemService } from '../notification-system/notification-system.service'
import { PushNotiSystemService } from '../push-noti-system/push-noti-system.service'

@Injectable()
export class ActivityCollaboratorSystemService {
    constructor(
        private customExceptionService: CustomExceptionService,
        private notificationService: NotificationService,
        private notificationSystemService: NotificationSystemService,
        private generalHandleService: GeneralHandleService,
        private historyRepositoryService: HistoryActivityRepositoryService,
        private collaboratorRepositoryService: CollaboratorRepositoryService,
        private customerRepositoryService: CustomerRepositoryService,
        private pushNotiSystemService: PushNotiSystemService,

        @InjectModel(HistoryOrder.name) private historyOrderModel: Model<HistoryOrderDocument>,
        @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
        @InjectModel(UserSystem.name) private userSystemModel: Model<UserSystemDocument>,
        @InjectModel(Collaborator.name) private collaboratorModel: Model<CollaboratorDocument>,
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @InjectModel(GroupOrder.name) private groupOrderModel: Model<GroupOrderDocument>,
        @InjectModel(DeviceToken.name) private deviceTokenModel: Model<DeviceTokenDocument>,
        @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
        @InjectModel(HistoryActivity.name) private historyActivityModel: Model<HistoryActivityDocument>,
        @InjectModel(ReasonCancel.name) private reasonCancelModel: Model<ReasonCancelDocument>,
        @InjectModel(Promotion.name) private promotionModel: Model<PromotionDocument>,
        @InjectModel(InfoTestCollaborator.name) private infoTestCollaboratorModel: Model<ExamTestDocument>,

    ) { }


    async newAccount(idCollaborator) {
        try {
            const temp = {
                en: "Collaborator create account successfully",
                vi: "CTV đã tạo tài khoản thành công"
            }
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(idCollaborator);
            const temp2 = `${getCollaborator._id} đăng kí thành công tài khoản`

            const newItem = new this.historyActivityModel({
                id_collaborator: idCollaborator,
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "collaborator_create_new_account",
                date_create: new Date(Date.now()).toISOString()
            })
            await newItem.save();
            return true;
        } catch (err) {
            // this.logger.error(err.response || err.toString());
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async verifyAccount(idCollaborator) {
        try {
            const arrDeviceToken = await this.deviceTokenModel.find({ user_id: idCollaborator })
            if (arrDeviceToken.length > 0) {
                const payload = {
                    title: "Tài khoản đã được phê duyệt",
                    body: "Chúc mừng bạn, tài khoản của bạn đã được phê duyệt",
                    token: [arrDeviceToken[0].token]
                }
                for (let i = 1; i < arrDeviceToken.length; i++) {
                    payload.token.push(arrDeviceToken[i].token)
                }
                this.notificationService.send(payload)
            }
            return true;
        } catch (err) {
            // this.logger.error(err.response || err.toString());
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async confirmOrder(collaborator: CollaboratorDocument, idOrder, groupOrder, admin?: UserSystemDocument) {
        try {
            const getOrder = await this.orderModel.findById(idOrder);
            const getCustomer = await this.customerRepositoryService.findOneById(getOrder.id_customer.toString());
            const temp = {
                en: "Collaborator had confirmed this job",
                vi: "CTV đã xác nhận công việc"
            }
            const temp2 = `${collaborator._id} đã xác nhận công việc ${idOrder}`;
            let typeActivity = "collaborator_confirm_order"
            let adminTitle = temp2;
            if (admin !== undefined) {
                adminTitle = `${admin?.full_name} đã gán đơn cho ${collaborator?.full_name}`,
                    typeActivity = "admin_assign_collaborator";
            }
            //console.log(adminTitle, "admin title");

            const newItem = new this.historyActivityModel({
                id_collaborator: collaborator._id,
                title: temp,
                title_admin: adminTitle,
                body: temp,
                type: typeActivity,
                date_create: new Date(Date.now()).toISOString(),
                id_order: getOrder._id,
                id_group_order: groupOrder._id,
                id_admin_action: (admin !== undefined) ? admin?._id : null
            })
            await newItem.save();
            const title = {
                vi: `Nhận việc thành công`,
                en: `Take job success`
            }
            const description = {
                vi: `Chúc mừng bạn đã nhận việc thành công `,
                en: `Congratulation!! You had took the job successfully`
            }
            const payloadNotification = {
                title: title,
                description: description,
                user_object: "collaborator",
                id_collaborator: collaborator._id,
                type_notification: "activity",
                related_id: idOrder,
                id_order: idOrder,
                id_group_order: groupOrder._id,
                type_schedule: groupOrder.type
            }
            this.notificationSystemService.newActivity(payloadNotification);
            // Bắn noti chi KH
            const title2 = {
                vi: `${collaborator.full_name} đã xác nhận đơn ${getOrder.id_view}`,
                en: `${collaborator.full_name} confirmed order ${getOrder.id_view}`
            }
            const des2 = {
                vi: `${collaborator.full_name} đã nhận việc. Vui lòng giữ điện thoại ở chế độ liên lạc và sẵn sàng mô tả thêm về công việc khi "Cộng tác viên" đến nơi`,
                en: `${collaborator.full_name} accepted the job. Please keep your phone in communication mode and be ready to describe the work further when the "Collaborator" arrives`
            }
            const payloadNotiCustomer = {
                title: title2,
                description: des2,
                user_object: "customer",
                id_customer: getCustomer._id,
                type_notification: "activity",
                related_id: idOrder,
                id_order: idOrder,
                id_group_order: groupOrder._id,
                type_schedule: groupOrder.type
            }
            this.notificationSystemService.newActivity(payloadNotiCustomer)
            const arrDeviceToken = await this.deviceTokenModel.find({ user_id: getOrder.id_customer["_id"], user_object: "customer" })
            if (arrDeviceToken.length > 0) {
                const payload = {
                    title: `${collaborator.full_name} đã xác nhận đơn ${getOrder.id_view}`,
                    body: `${collaborator.full_name} đã nhận việc. Vui lòng giữ điện thoại ở chế độ liên lạc và sẵn sàng mô tả thêm về công việc khi "Cộng tác viên" đến nơi`,
                    token: [arrDeviceToken[0].token],
                    data: { link: "guviapp://Activity" }
                }
                for (let i = 1; i < arrDeviceToken.length; i++) {
                    payload.token.push(arrDeviceToken[i].token)
                }
                this.notificationService.send(payload)
            }
            // // Bắn Noti cho CTV
            // const arrDeviceToken2 = await this.deviceTokenModel.find({ user_id: getOrder.id_collaborator, user_object: "collaborator" })
            // if (arrDeviceToken2.length > 0) {
            //     const payload = {
            //         title: `GUVI Partner`,
            //         body: `✅ Bạn đã nhấn "Bắt đầu" ca làm #1000111.0001
            //         👉 Nhớ xuất trình CCCD và trao đổi công việc với khách hàng !!!`,
            //         token: [arrDeviceToken2[0].token],
            //         data: { link: "guvipartner://" }
            //     }
            //     for (let i = 1; i < arrDeviceToken2.length; i++) {
            //         payload.token.push(arrDeviceToken2[i].token)
            //     }
            //     this.notificationService.send(payload)
            // }
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async doingOrder(idCollaborator, order, idGroupOrder) {
        try {
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(idCollaborator);
            // const getOrder = await this.orderModel.findById(idOrder);
            const getService = await this.serviceModel.findById(order.service["_id"]);
            const temp = {
                en: "Collaborator is doing this job",
                vi: "CTV đang làm công việc"
            }
            const temp2 = `${getCollaborator._id} đang làm công việc ${order._id}`
            const newItem = new this.historyActivityModel({
                id_collaborator: idCollaborator,
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "collaborator_doing_order",
                id_order: order._id,
                id_group_order: idGroupOrder,
                date_create: new Date(Date.now()).toISOString()
            })
            await newItem.save();
            const title = {
                vi: `GUVI Partner`,
                en: `GUVI Partner`
            }
            const description = {
                vi: `✅ Bạn đã nhấn "Bắt đầu" ca làm ${order.id_view} \n 👉 Nhớ xuất trình CCCD và trao đổi công việc với khách hàng !!!`,
                en: `✅ Bạn đã nhấn "Bắt đầu" ca làm ${order.id_view} \n 👉 Nhớ xuất trình CCCD và trao đổi công việc với khách hàng !!!`
            }
            const payloadNotification = {
                title: title,
                description: description,
                user_object: "collaborator",
                id_collaborator: idCollaborator,
                type_notification: "activity",
                related_id: order._id,
                id_order: order._id
            }
            this.notificationSystemService.newActivity(payloadNotification);
            const arrDeviceToken2 = await this.deviceTokenModel.find({ user_id: order.id_collaborator, user_object: "collaborator" })
            if (arrDeviceToken2.length > 0) {
                const payload = {
                    title: title.vi,
                    body: description.vi,
                    token: [arrDeviceToken2[0].token],
                    data: { link: "guvipartner://Activity" }
                }
                for (let i = 1; i < arrDeviceToken2.length; i++) {
                    payload.token.push(arrDeviceToken2[i].token)
                }
                this.notificationService.send(payload)
            }
            // Bắn noti KH
            const title2 = {
                vi: 'GUVI',
                en: "GUVI"
            };
            const des2 = {
                vi: `${getCollaborator.full_name} đã xác nhận bắt đầu ca làm việc. Nếu CTV vẫn chưa tới, vui lòng liên hệ hotline 1900.0027 để được hỗ trợ.`,
                en: `${getCollaborator.full_name} shift start confirmed. If collaborators still have not arrived, please contact hotline 1900.0027 for assistance.`
            }
            const payloadNotiCustomer = {
                title: title2,
                description: des2,
                user_object: "customer",
                id_customer: order.id_customer,
                type_notification: "activity",
                related_id: order._id,
                id_order: order._id
            }
            this.notificationSystemService.newActivity(payloadNotiCustomer);
            const arrDeviceToken = await this.deviceTokenModel.find({ user_id: order.id_customer, user_object: "customer" })
            if (arrDeviceToken.length > 0) {
                const payload = {
                    title: "GUVI",
                    body: `${getCollaborator.full_name} đã xác nhận bắt đầu ca làm việc. Nếu CTV vẫn chưa tới, vui lòng liên hệ hotline 1900.0027 để được hỗ trợ.`,
                    token: [arrDeviceToken[0].token],
                    data: { link: "guviapp://Activity" }
                }
                for (let i = 1; i < arrDeviceToken.length; i++) {
                    payload.token.push(arrDeviceToken[i].token)
                }
                this.notificationService.send(payload)
            }
            return true;
        } catch (err) {
            // this.logger.error(err.response || err.toString());
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async startedOrder(idCollaborator, order, idGroupOrder, idCaptain) {
        try {
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(idCollaborator);
            // const getOrder = await this.orderModel.findById(idOrder);
            const getService = await this.serviceModel.findById(order.service["_id"]);
            const temp = {
                en: "Collaborator is started this job",
                vi: "CTV đã sẵn sàng làm việc"
            }
            const temp2 = `${getCollaborator._id} đã sẵn sàng làm việc ${order._id}`
            const newItem = new this.historyActivityModel({
                id_collaborator: idCollaborator,
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "collaborator_started_order",
                id_order: order._id,
                id_group_order: idGroupOrder,
                date_create: new Date(Date.now()).toISOString()
            })
            await newItem.save();
            const title = {
                vi: `Bạn đã sẵn sàng làm việc`,
                en: `Started the job successfully`
            }
            const description = {
                vi: `Bạn đã đã sẵn sàng làm việc ${getService.title.vi}`,
                en: `You have started this job ${getService.title.en}`
            }
            const payloadNotification = {
                title: title,
                description: description,
                user_object: "collaborator",
                id_collaborator: idCollaborator,
                type_notification: "activity",
                related_id: order._id,
                id_order: order._id
            }
            this.notificationSystemService.newActivity(payloadNotification);
            const arrDeviceToken = await this.deviceTokenModel.find({ user_id: idCaptain })
            if (arrDeviceToken.length > 0) {
                const payload = {
                    title: `CTV ${getCollaborator.full_name} đã sẵn sàng làm việc`,
                    body: `CTV ${getCollaborator.full_name} đã sẵn sàng làm việc, Bạn có thể xem chi tiết trong ca làm của mình để bắt đầu công việc!`,
                    token: [arrDeviceToken[0].token],
                    data: { link: "guvipartner://" }
                }
                for (let i = 1; i < arrDeviceToken.length; i++) {
                    payload.token.push(arrDeviceToken[i].token)
                }
                this.notificationService.send(payload)
            }
            return true;
        } catch (err) {
            // this.logger.error(err.response || err.toString());
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async doneOrder(idCollaborator, idOrder, idGroupOrder, noPushNoti?) {
        try {
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(idCollaborator);
            const getOrder = await this.orderModel.findById(idOrder);
            const getCustomer = await this.customerRepositoryService.findOneById(getOrder.id_customer.toString());
            const getService = await this.serviceModel.findById(getOrder.service["_id"]);
            const temp = {
                en: "Collaborator is done this job",
                vi: "CTV đã làm xong công việc"
            }
            const temp2 = `${getCollaborator._id} đã hoàn thành công việc ${idOrder}`
            const newItem = new this.historyActivityModel({
                id_collaborator: idCollaborator,
                id_order: idOrder,
                id_group_order: idGroupOrder,
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "collaborator_done_order",
                date_create: new Date(Date.now()).toISOString(),
                // value: getOrder.collaborator_fee
            })
            await newItem.save();
            const title = {
                vi: `GUVI Partner`,
                en: `GUVI Partner`
            }
            const description = {
                vi: `✅ Bạn đã nhấn "Kết thúc" ca làm ${getOrder.id_view} \n 👉 Đổ rác (nếu có) và chào khách ra về bạn nhé !!!`,
                en: `✅ Bạn đã nhấn "Kết thúc" ca làm ${getOrder.id_view} \n 👉 Đổ rác (nếu có) và chào khách ra về bạn nhé !!!`
            }
            const payloadNotification = {
                title: title,
                description: description,
                user_object: "collaborator",
                id_collaborator: idCollaborator,
                type_notification: "activity",
                related_id: idOrder,
                id_group_order: idGroupOrder,
                id_order: idOrder
            }
            this.notificationSystemService.newActivity(payloadNotification);

            // Bắn noti KH
            const title2 = {
                vi: `GUVI`,
                en: "GUVI"
            };
            const des2 = {
                vi: `"Cộng tác viên" đã hoàn thành công việc của mình. Bạn hãy dành ít phút để kiểm tra lại mọi thứ nhé.`,
                en: `"Collaborator" has completed her work. Please take a few minutes to check everything.`
            }
            const payloadNotiCustomer = {
                title: title2,
                description: des2,
                user_object: "customer",
                id_customer: getCustomer._id,
                type_notification: "activity",
                related_id: idOrder,
                id_group_order: idGroupOrder,
                id_order: idOrder
            }
            this.notificationSystemService.newActivity(payloadNotiCustomer)

            const arrDeviceToken = await this.deviceTokenModel.find({ user_id: getOrder.id_customer["_id"], user_object: "customer" })
            if (arrDeviceToken.length > 0 && !noPushNoti) {
                // nếu noPushNoti mà là fasle thì sẽ bắn thông báo cho KH đây là cách chữa cháy khi chưa chắc là sẽ thay hết tất cả các tham số ở các vị trí khác
                const payload = {
                    title: "GUVI",
                    body: `"Cộng tác viên" đã hoàn thành công việc của mình. Bạn hãy dành ít phút để kiểm tra lại mọi thứ nhé.`,
                    token: [arrDeviceToken[0].token],
                    data: { link: "guviapp://Activity" }
                }
                for (let i = 1; i < arrDeviceToken.length; i++) {
                    payload.token.push(arrDeviceToken[i].token)
                }
                this.notificationService.send(payload)
            }
            return true;
        } catch (err) {
            // this.logger.error(err.response || err.toString());
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async cancelOrder(collaborator, order, reasonCancel, idGroupOrder, minute) {
        try {
            const type = minute > 60 ? 'collaborator_cancel_order_over_60_min'
                : minute > 30 ? 'collaborator_cancel_order_over_30_min' : 'collaborator_cancel_order_below_30_min';
            const getService = await this.serviceModel.findById(order.service._id);
            const temp = {
                en: "Collaborator cancel this job",
                vi: "CTV đã huỷ công việc"
            }
            const temp2 = `${collaborator._id} đã huỷ công việc ${order._id} với lí do ${reasonCancel._id}`
            const newItem = new this.historyActivityModel({
                id_collaborator: collaborator._id,
                id_reason_cancel: reasonCancel._id,
                title: temp,
                title_admin: temp2,
                body: temp,
                type,
                date_create: new Date(Date.now()).toISOString(),
                id_order: order._id,
                id_group_order: idGroupOrder
            })
            await newItem.save();
            //Bắn TB cho CTV
            const title = {
                vi: `GUVI Partner`,
                en: `GUVI Partner`
            }
            const description = {
                vi: `✅ Bạn đã "Hủy" ca làm ${order.id_view}`,
                en: `✅ You have "Canceled" your shift ${order.id_view}`
            }
            const payloadNotification = {
                title: title,
                description: description,
                user_object: "collaborator",
                id_collaborator: collaborator._id,
                type_notification: "activity",
                related_id: order._id,
                id_order: order._id,
                id_group_order: idGroupOrder,
            }
            this.notificationSystemService.newActivity(payloadNotification);
            const arrDeviceToken2 = await this.deviceTokenModel.find({ user_id: collaborator._id, user_object: "collaborator" })
            if (arrDeviceToken2.length > 0) {
                const payload = {
                    token: [arrDeviceToken2[0].token],
                    title: title.vi,
                    body: description.vi,
                    data: { link: "guvipartner://Activity" }
                }
                for (let i = 1; i < arrDeviceToken2.length; i++) {
                    payload.token.push(arrDeviceToken2[i].token)
                }
                this.notificationService.send(payload)
            }
            // const lg = this.notificationSystemService.newActivity(payloadNotification);
            // console.log(lg, "check lg")
            // Bắn tb cho KH
            let title2 = {
                vi: 'GUVI',
                en: 'GUVI'
            };
            let des = {
                vi: "",
                en: ""
            }
            // Chỉnh sửa nội dung Tb dựa vào khoảng thời gian chênh lệch khi CTV hủy đơn
            if (minute > 60) {
                des = {
                    vi: `Oops, CTV "${collaborator.full_name}" đã hủy công việc ${order.id_view} của bạn. Đừng lo, GUVI đang tìm kiếm "Cộng tác viên" mới cho bạn.`,
                    en: `Oops, Collaborator "${collaborator.full_name}" canceled your job ${order.id_view}. Don't worry, GUVI is looking for new "Collaborators" for you.`
                }
            } else if (minute > 30 && minute < 60) {
                des = {
                    vi: `Oops, CTV "${collaborator.full_name}" đã hủy công việc ${order.id_view} của bạn. Đừng lo, GUVI đang tìm kiếm "Cộng tác viên" mới cho bạn. Hoặc liên hệ hotline 1900.0027 để được hỗ trợ ngay nhé.`,
                    en: `Oops, Collaborator "${collaborator.full_name}" canceled your job ${order.id_view}. Don't worry, GUVI is looking for new "Collaborators" for you. Or contact hotline 1900.0027 for immediate support.`
                }
            } else {
                des = {
                    vi: `Oops, CTV "${collaborator.full_name}" đã hủy công việc ${order.id_view} của bạn. GUVI sẽ kiểm tra và xử lý vi phạm không được phép của CTV. Bạn hãy liên hệ hotline 1900.0027 để được hỗ trợ.`,
                    en: `Oops, Collaborator "${collaborator.full_name}" canceled your job ${order.id_view}. GUVI will check and handle unauthorized violations by collaborators. Please contact hotline 1900.0027 for support.`
                }
            }
            const arrDeviceToken = await this.deviceTokenModel.find({ user_id: order.id_customer, user_object: "customer" })
            if (arrDeviceToken.length > 0) {
                const payload = {
                    token: [arrDeviceToken[0].token],
                    title: title2.vi,
                    body: des.vi,
                    data: { link: "guviapp://Activity" }
                }
                for (let i = 1; i < arrDeviceToken.length; i++) {
                    payload.token.push(arrDeviceToken[i].token)
                }
                this.notificationService.send(payload)
            }
            const payloadNotiCustomer = {
                title: title2,
                description: des,
                user_object: "customer",
                id_customer: order.id_customer,
                type_notification: "activity",
                id_order: order._id
            }
            this.notificationSystemService.newActivity(payloadNotiCustomer)
            return true;
        } catch (err) {
            // this.logger.error(err.response || err.toString());
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async cancelOrderBelow60Min(collaborator, order, reasonCancel, idGroupOrder,) {

    }

    async topUp(collaborator, transition: TransitionCollaboratorDocument) {
        try {
            const title = {
                vi: `Tạo thành công lệnh nạp ${transition.transfer_note}`,
                en: `Create top up ${transition.transfer_note} successfully`
            }
            const formatMoneyTranfer = await this.generalHandleService.formatMoney(transition.money);
            const title_admin = `${collaborator._id} đã tạo lệnh nạp ${transition._id} với nội dung ${transition.transfer_note}`
            this.historyRepositoryService.create({
                id_collaborator: collaborator._id,
                id_transaction: transition._id,
                title: title,
                title_admin: title_admin,
                body: title,
                type: "collaborator_top_up",
                date_create: new Date(Date.now()).toISOString(),
                value: transition.money,
            })
            // await newItem.save();
            const titleNoti = {
                vi: `Tạo thành công lệnh nạp`,
                en: `Create top up success`
            }
            const payloadNotification = {
                title: titleNoti,
                description: title,
                user_object: "collaborator",
                id_collaborator: collaborator._id,
                type_notification: "activity",
                related_id: transition._id,
                value: transition.money,
                id_transistion_collaborator: transition._id
            }
            this.notificationSystemService.newActivity(payloadNotification);

            const arrDeviceToken = await this.deviceTokenModel.find({ user_id: collaborator._id, user_object: "collaborator" })
            if (arrDeviceToken.length > 0) {
                const payload = {
                    title: "Bạn đã tạo thành công lệnh nạp tiền vào tài khoản",
                    body: `Bạn đã tạo thành công lệnh nạp ${formatMoneyTranfer} vào tài khoản`,
                    token: [arrDeviceToken[0].token],
                    data: { link: "guvipartner://Wallet" }
                }
                for (let i = 1; i < arrDeviceToken.length; i++) {
                    payload.token.push(arrDeviceToken[i].token)
                }
                this.notificationService.send(payload)
            }
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async confirmTranfed(collaborator, transition) {
        try {
            const temp = {
                vi: `Xác nhận chuyển tiền cho lệnh ${transition.transfer_note} thành công`,
                en: `Confirm top up ${transition.transfer_note} successfully`
            }
            const temp2 = `${collaborator._id} đã xác nhận chuyển tiền của ${transition._id} với nội dung ${transition.transfer_note} thành công`;
            const newItem = new this.historyActivityModel({
                id_collaborator: collaborator._id,
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "collaborator_confirm_top_up",
                date_create: new Date(Date.now()).toISOString(),
                id_transaction: transition._id,
                value: transition.money,
            })
            await newItem.save();

            // Tạm thời không có trả thông báo này về 
            // const title = {
            //     vi: `Xác nhận chuyển tiền thành công`,
            //     en: `Confirm top up success`
            // }
            // const payloadNotification = {
            //     title: title,
            //     description: temp,
            //     user_object: "collaborator",
            //     id_collaborator: collaborator._id,
            //     type_notification: "activity",
            //     related_id: transition._id,
            //     value: transition.money,
            //     id_transistion_collaborator: transition._id
            // }
            // this.notificationSystemService.newActivity(payloadNotification);
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async cancelTranfer(collaborator, transition) {
        try {
            let temp;
            let temp2;
            if (transition.type_transfer === 'top_up') {
                temp = {
                    vi: `CTV ${collaborator.id_view} đã hủy lệnh nạp`,
                    en: `Collaborator ${collaborator.id_view} cancled the tranfer`
                }
                temp2 = `CTV ${collaborator.id_view} đã hủy lệnh nạp`;
            } else {
                temp = {
                    vi: `CTV ${collaborator.id_view} đã hủy lệnh rút`,
                    en: `Collaborator ${collaborator.id_view} cancled the tranfer`
                }
                temp2 = `CTV ${collaborator.id_view} đã hủy lệnh rút`;
            }


            const item = await this.historyRepositoryService.create({
                id_collaborator: collaborator._id,
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "collaborator_cancel_tranfer",
                date_create: new Date(Date.now()).toISOString(),
                id_transaction: transition._id,
                value: transition.money,
            });
            // Tạm thời không có trả thông báo này về 
            // const title = {
            //     vi: `Xác nhận chuyển tiền thành công`,
            //     en: `Confirm top up success`
            // }
            // const payloadNotification = {
            //     title: title,
            //     description: temp,
            //     user_object: "collaborator",
            //     id_collaborator: collaborator._id,
            //     type_notification: "activity",
            //     related_id: transition._id,
            //     value: transition.money,
            //     id_transistion_collaborator: transition._id
            // }
            // this.notificationSystemService.newActivity(payloadNotification);
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async withdraw(collaborator, transition) {
        try {
            const temp = {
                vi: `Tạo thành công lệnh rút`,
                en: `Create withdraw successfully`
            }
            const temp2 = `${collaborator._id} đã tạo lệnh rút ${transition._id}`
            const newItem = new this.historyActivityModel({
                id_collaborator: collaborator._id,
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "collaborator_withdraw",
                date_create: new Date(Date.now()).toISOString(),
                value: -transition.money,
                id_transaction: transition._id,
            })
            const title = {
                vi: `Tạo thành công lệnh rút`,
                en: `Create withdraw successfully`
            }

            const payloadNotification = {
                title: temp,
                description: temp,
                user_object: "collaborator",
                id_collaborator: collaborator._id,
                type_notification: "activity",
                related_id: transition._id,
                id_transistion_collaborator: transition._id
            }
            await newItem.save();
            this.notificationSystemService.newActivity(payloadNotification);
            const arrDeviceToken = await this.deviceTokenModel.find({ user_id: collaborator._id, user_object: "collaborator" })
            if (arrDeviceToken.length > 0) {
                const payload = {
                    title: "Bạn đã tạo thành công lệnh rút tiền khỏi tài khoản",
                    body: `Bạn đã tạo thành công lệnh rút ${transition.money} VND khỏi tài khoản`,
                    token: [arrDeviceToken[0].token],
                    data: { link: "guvipartner://Wallet" }
                }
                for (let i = 1; i < arrDeviceToken.length; i++) {
                    payload.token.push(arrDeviceToken[i].token)
                }
                this.notificationService.send(payload)
            }
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }



    async refundPlatformFee(collaborator, platform_fee, order, service, idGroupOrder, previousBalance) {
        try {
            const temp = {
                vi: `Hoàn phí đơn khách ${order.name_customer}`,
                en: `Refund order of customer ${order.name_customer}`
            }
            const tempPlatformFee = await this.generalHandleService.formatMoney(platform_fee);
            const temp2 = `${collaborator._id} được hoàn ${platform_fee} phí dịch vụ từ công việc ${order._id}`
            const newItem = new this.historyActivityModel({
                id_collaborator: collaborator._id,
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "refund_platform_fee_cancel_order",
                date_create: (previousBalance.date_create && previousBalance.date_create !== null)
                    ? previousBalance.date_create : new Date(Date.now()).toISOString(),
                value: platform_fee,
                id_order: order._id,
                id_group_order: idGroupOrder,

                current_collaborator_wallet: collaborator.collaborator_wallet,
                status_current_collaborator_wallet: (previousBalance.collaborator_wallet < collaborator.collaborator_wallet) ?
                    "up" : (previousBalance.collaborator_wallet > collaborator.collaborator_wallet) ? "down" : "none",
                current_work_wallet: collaborator.work_wallet,
                status_current_work_wallet: (previousBalance.work_wallet < collaborator.work_wallet) ?
                    "up" : (previousBalance.work_wallet > collaborator.work_wallet) ? "down" : "none",
            })
            const description = {
                vi: `Ca làm ${order.id_view} đã bị hủy. Bạn được hoàn lại số tiền ${tempPlatformFee} vào "Ví Nạp" `,
                en: `Shift ${order.id_view} has been canceled. You will receive a refund of ${tempPlatformFee} to "Deposit Wallet"`
            }
            const title = {
                vi: `Hoàn tiền thành công`,
                en: `Refund money success`
            }
            const payloadNotification = {
                title: title,
                description: description,
                user_object: "collaborator",
                id_collaborator: collaborator._id,
                type_notification: "activity",
                related_id: order._id,
                id_order: order._id
            }
            await newItem.save();
            this.notificationSystemService.newActivity(payloadNotification);

            const arrDeviceToken = await this.deviceTokenModel.find({ user_id: collaborator._id, user_object: "collaborator" })
            if (arrDeviceToken.length > 0) {
                const payload = {
                    title: title.vi,
                    body: description.vi,
                    token: [arrDeviceToken[0].token],
                    data: { link: "guvipartner://Wallet" }

                }
                for (let i = 1; i < arrDeviceToken.length; i++) {
                    payload.token.push(arrDeviceToken[i].token)
                }
                this.notificationService.send(payload)
            }
            return true;
        } catch (err) {
            // this.logger.error(err.response || err.toString());
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async minusPlatformFee(collaborator, platform_fee, order, service, idGroupOrder, previousBalance) {
        try {
            const temp = {
                en: `Minus platformfee from customer ${order.name_customer}`,
                vi: `Thu phí dịch vụ đơn khách ${order.name_customer}`
            }
            const formatPlatformFee = await this.generalHandleService.formatMoney(platform_fee);
            const description = {
                vi: `Thu phí dịch vụ ${formatPlatformFee} từ đơn ${order.id_view}`,
                en: `Minus platfom fee ${formatPlatformFee} from ${order.id_view}`
            }
            const temp2 = `Thu phí dịch vụ ${formatPlatformFee} từ ${collaborator._id} cho công việc ${order._id}`
            const newItem = new this.historyActivityModel({
                id_collaborator: collaborator._id,
                title: temp,
                title_admin: temp2,
                body: description,
                type: "minus_platform_fee",
                date_create: new Date(Date.now()).toISOString(),
                id_order: order._id,
                id_group_order: idGroupOrder,
                value: -platform_fee,
                current_collaborator_wallet: collaborator.collaborator_wallet,
                status_current_collaborator_wallet: (previousBalance.collaborator_wallet < collaborator.collaborator_wallet) ?
                    "up" : (previousBalance.collaborator_wallet > collaborator.collaborator_wallet) ? "down" : "none",
                current_work_wallet: collaborator.work_wallet,
                status_current_work_wallet: (previousBalance.work_wallet < collaborator.work_wallet) ?
                    "up" : (previousBalance.work_wallet > collaborator.work_wallet) ? "down" : "none",

            })
            await newItem.save();

            const title = {
                vi: "GUVI Partner",
                en: "GUVI Partner"
            }
            const des = {
                vi: `Đã xác nhận nhận ca làm ${order.id_view} của khách hàng "${order.name_customer}".\nThu phí dịch vụ ${formatPlatformFee}. Nhấn để kiểm tra thông tin ngay bạn nhé.`,
                en: `Customer "${order.name_customer}" shift ${order.id_view} has been confirmed.\nService fee ${formatPlatformFee} collected. Click to check the information now.`
            }
            const payloadNotification = {
                title: title,
                description: des,
                user_object: "collaborator",
                id_collaborator: collaborator._id,
                type_notification: "activity",
                related_id: order._id,
                value: platform_fee,
                id_order: order._id
            }
            this.notificationSystemService.newActivity(payloadNotification);
            const arrDeviceToken = await this.deviceTokenModel.find({ user_id: collaborator._id, user_object: "collaborator" })
            if (arrDeviceToken.length > 0) {
                const payload = {
                    title: title.vi,
                    body: des.vi,
                    token: [arrDeviceToken[0].token],
                    data: { link: "guvipartner://Wallet" }
                }
                for (let i = 1; i < arrDeviceToken.length; i++) {
                    payload.token.push(arrDeviceToken[i].token)
                }
                this.notificationService.send(payload)
            }
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    /**
     * 
     * @param collaborator thông tin CTV
     * @param refundMoney số tiền cần trả cho CTV
     * @param order đơn hàng
     * @param service loại dịch vụ
     * @param idGroupOrder id nhóm đơn hàng
     * @param previousBalance thông tin số dư tài khoản của CTV trước khi được trả tiền
     * @returns log thông báo CTV được nhận thêm tiền từ công việc
     */
    async receiveRefundMoney(collaborator, refundMoney, order, service, idGroupOrder, previousBalance: previousBalanceCollaboratorDTO) {
        try {
            const temp = {
                vi: `Nhận tiền từ công việc ${service.title.vi}`,
                en: `Get money from work ${service.title.en}`
            }
            const formatRefundMoney = await this.generalHandleService.formatMoney(refundMoney);
            const temp2 = `${collaborator._id} được nhận ${formatRefundMoney} từ đơn hàng ${order._id}`
            const newItem = new this.historyActivityModel({
                id_collaborator: collaborator._id,
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "collaborator_receive_refund_money",
                date_create: new Date(Date.now()).toISOString(),
                value: refundMoney,
                id_order: order._id,
                id_group_order: idGroupOrder,
                current_remainder: collaborator.remainder,
                status_current_remainder: (previousBalance.remainder < collaborator.remainder) ?
                    "up" : (previousBalance.remainder > collaborator.remainder) ? "down" : "none",
                current_gift_remainder: collaborator.gift_remainder,
                status_current_gift_remainder: (previousBalance.gift_remainder < collaborator.gift_remainder) ?
                    "up" : (previousBalance.gift_remainder > collaborator.gift_remainder) ? "down" : "none",
                current_collaborator_wallet: collaborator.collaborator_wallet,
                status_current_collaborator_wallet: (previousBalance.collaborator_wallet < collaborator.collaborator_wallet) ?
                    "up" : (previousBalance.collaborator_wallet > collaborator.collaborator_wallet) ? "down" : "none",
                current_work_wallet: collaborator.work_wallet,
                status_current_work_wallet: (previousBalance.work_wallet < collaborator.work_wallet) ?
                    "up" : (previousBalance.work_wallet > collaborator.work_wallet) ? "down" : "none",
            })
            const description = {
                vi: `Nhận ${formatRefundMoney} từ công việc ${service.title.vi}`,
                en: `Get ${formatRefundMoney} from job ${service.title.vi}`
            }
            const payloadNotification = {
                title: temp,
                description: description,
                user_object: "collaborator",
                id_collaborator: collaborator._id,
                type_notification: "activity",
                related_id: order._id,
                id_order: order._id
            }
            await newItem.save();
            // console.log("check newItem", newItem)
            this.notificationSystemService.newActivity(payloadNotification);
            const arrDeviceToken = await this.deviceTokenModel.find({ user_id: collaborator._id, user_object: "collaborator" })
            if (arrDeviceToken.length > 0) {
                const payload = {
                    title: temp.vi,
                    body: description.vi,
                    token: [arrDeviceToken[0].token],
                    data: { link: "guvipartner://Wallet" }

                }
                for (let i = 1; i < arrDeviceToken.length; i++) {
                    payload.token.push(arrDeviceToken[i].token)
                }
                this.notificationService.send(payload)
            }
            return true;
        } catch (err) {
            // this.logger.error(err.response || err.toString());
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }


    async receiveInitialFeeMoney(collaborator, initialFee, order, service, getGroupOrder, previousBalance) {
        try {
            const temp = {
                vi: `Nhận tiền từ công việc ${service.title.vi}`,
                en: `Get money from work ${service.title.en}`
            }
            const formatInitialFeeMoney = await this.generalHandleService.formatMoney(initialFee);
            const temp2 = `${collaborator._id} được nhận ${formatInitialFeeMoney} từ đơn hàng ${order._id}`
            const newItem = new this.historyActivityModel({
                id_collaborator: collaborator._id,
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "collaborator_receive_platform_fee",
                date_create: new Date(Date.now()).toISOString(),
                value: initialFee,
                id_order: order._id,
                id_group_order: getGroupOrder._id,
                current_remainder: collaborator.remainder,
                status_current_remainder: (previousBalance.remainder < collaborator.remainder) ?
                    "up" : (previousBalance.remainder > collaborator.remainder) ? "down" : "none",
                current_gift_remainder: collaborator.gift_remainder,
                status_current_gift_remainder: (previousBalance.gift_remainder < collaborator.gift_remainder) ?
                    "up" : (previousBalance.gift_remainder > collaborator.gift_remainder) ? "down" : "none",
            })
            const description = {
                vi: `Nhận ${formatInitialFeeMoney} từ công việc ${service.title.vi}`,
                en: `Get ${formatInitialFeeMoney} from job ${service.title.vi}`
            }
            const payloadNotification = {
                title: temp,
                description: description,
                user_object: "collaborator",
                id_collaborator: collaborator._id,
                type_notification: "activity",
                related_id: order._id,
                id_order: order._id
            }
            await newItem.save();
            this.notificationSystemService.newActivity(payloadNotification);
            const arrDeviceToken = await this.deviceTokenModel.find({ user_id: collaborator._id, user_object: "collaborator" })
            if (arrDeviceToken.length > 0) {
                const payload = {
                    title: temp.vi,
                    body: description.vi,
                    token: [arrDeviceToken[0].token],
                    data: { link: "guvipartner://Wallet" }

                }
                for (let i = 1; i < arrDeviceToken.length; i++) {
                    payload.token.push(arrDeviceToken[i].token)
                }
                this.notificationService.send(payload)
            }
            return true;
        } catch (err) {
            // this.logger.error(err.response || err.toString());
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async minusPendingMoney(collaborator, pendingMoney, order, service, idGroupOrder, previousBalance) {
        try {
            const temp = {
                vi: `Thu hộ từ công việc ${service.title.vi}`,
                en: `Get more money from work ${service.title.en}`
            }
            const formatMoney = await this.generalHandleService.formatMoney(pendingMoney);
            const temp2 = `Thu hộ từ CTV ${collaborator._id} thêm ${formatMoney} cho đơn hàng ${order._id}`
            const newItem = new this.historyActivityModel({
                id_collaborator: collaborator._id,
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "collaborator_minus_pending_money",
                date_create: new Date(Date.now()).toISOString(),
                value: -pendingMoney,
                id_order: order._id,
                id_group_order: idGroupOrder,
                current_remainder: collaborator.remainder,
                status_current_remainder: (previousBalance.remainder < collaborator.remainder) ?
                    "up" : (previousBalance.remainder > collaborator.remainder) ? "down" : "none",
                current_gift_remainder: collaborator.gift_remainder,
                status_current_gift_remainder: (previousBalance.gift_remainder < collaborator.gift_remainder) ?
                    "up" : (previousBalance.gift_remainder > collaborator.gift_remainder) ? "down" : "none",
            })

            const description = {
                vi: `Thu hộ ${formatMoney} từ công việc ${service.title.vi}`,
                en: ``
            }
            const payloadNotification = {
                title: temp,
                description: description,
                user_object: "collaborator",
                id_collaborator: collaborator._id,
                type_notification: "activity",
                related_id: order._id,
                id_order: order._id
            }
            await newItem.save();
            this.notificationSystemService.newActivity(payloadNotification);
            return true;
        } catch (err) {
            // this.logger.error(err.response || err.toString());
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async refundCollaboratorFee(collaborator, collaboratorFee, order, service, previousBalance) {
        try {
            const temp = {
                vi: `Hoàn tiền từ công việc ${service.title.vi}`,
                en: `Refund money from work ${service.title.en}`
            }

            const temp2 = `${collaborator._id} được hoàn lại ${collaboratorFee}đ từ đơn hàng ${order._id}`
            const newItem = new this.historyActivityModel({
                id_collaborator: collaborator._id,
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "refund_collaborator_fee",
                date_create: new Date(Date.now()).toISOString(),
                value: collaboratorFee,
                id_order: order._id,
                current_remainder: collaborator.remainder,
                status_current_remainder: (previousBalance.remainder < collaborator.remainder) ?
                    "up" : (previousBalance.remainder > collaborator.remainder) ? "down" : "none",
                current_gift_remainder: collaborator.gift_remainder,
                status_current_gift_remainder: (previousBalance.gift_remainder < collaborator.gift_remainder) ?
                    "up" : (previousBalance.gift_remainder > collaborator.gift_remainder) ? "down" : "none",
            })

            const description = {
                vi: `Hoàn lại ${collaboratorFee}đ từ công việc ${service.title.vi}`,
                en: ``
            }
            const payloadNotification = {
                title: temp,
                description: description,
                user_object: "collaborator",
                id_collaborator: collaborator._id,
                type_notification: "activity",
                related_id: order._id,
                id_order: order._id
            }
            await newItem.save();
            this.notificationSystemService.newActivity(payloadNotification);
            const arrDeviceToken = await this.deviceTokenModel.find({ user_id: collaborator._id, user_object: "collaborator" })
            if (arrDeviceToken.length > 0) {
                const payload = {
                    title: temp.vi,
                    body: description.vi,
                    token: [arrDeviceToken[0].token],
                    data: { link: "guvipartner://Wallet" }

                }
                for (let i = 1; i < arrDeviceToken.length; i++) {
                    payload.token.push(arrDeviceToken[i].token)
                }
                this.notificationService.send(payload)
            }
            return true;
        } catch (err) {
            // this.logger.error(err.response || err.toString());
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async collaboratorCreateAddress(collaborator, address) {
        try {
            const temp = {
                vi: `CTV vừa tạo mới địa chỉ`,
                en: `Collaborator created new address`
            }
            const temp2 = `${collaborator._id} vừa tạo mới ${address._id}`
            const newItem = new this.historyActivityModel({
                id_collaborator: collaborator._id,
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "collaborator_create_new_address",
                date_create: new Date(Date.now()).toISOString(),
                value_string: address.address,
                id_address: address._id
            })

            const description = {
                vi: `${collaborator._id} vừa tạo mới ${address._id}`,
                en: ``
            }

            const payloadNotification = {
                title: temp,
                description: description,
                user_object: "collaborator",
                id_collaborator: collaborator._id,
                type_notification: "activity",
                related_id: address._id,
                id_address: address._id
            }
            await newItem.save();
            console.log('newItem', newItem)

            this.notificationSystemService.newActivity(payloadNotification);

            return true;
        } catch (err) {
            // this.logger.error(err.response || err.toString());
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }
    async collaboratorEditAddress(collaborator, address) {
        try {
            const temp = {
                vi: `CTV vừa sửa địa chỉ`,
                en: `Collaborator edited new address`
            }
            const temp2 = `${collaborator._id} vừa sửa ${address._id}`
            const newItem = new this.historyActivityModel({
                id_collaborator: collaborator._id,
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "collaborator_edit_address",
                date_create: new Date(Date.now()).toISOString(),
                value_string: address.address,
                id_address: address._id
            })

            const description = {
                vi: `${collaborator._id} vừa sửa ${address._id}`,
                en: ``
            }

            const payloadNotification = {
                title: temp,
                description: description,
                user_object: "collaborator",
                id_collaborator: collaborator._id,
                type_notification: "activity",
                related_id: address._id,
                id_address: address._id
            }
            await newItem.save();
            console.log('newItem', newItem)
            this.notificationSystemService.newActivity(payloadNotification);

            return true;
        } catch (err) {
            // this.logger.error(err.response || err.toString());
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }
    async collaboratorDeleteAddress(collaborator, address) {
        try {
            const temp = {
                vi: `CTV vừa xoá địa chỉ`,
                en: `Collaborator deleted new address`
            }
            const temp2 = `${collaborator._id} vừa xoá ${address._id}`
            const newItem = new this.historyActivityModel({
                id_collaborator: collaborator._id,
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "collaborator_delete_address",
                date_create: new Date(Date.now()).toISOString(),
                value_string: address.address,
                id_address: address._id
            })
            const description = {
                vi: `${collaborator._id} vừa xoá ${address._id}`,
                en: ``
            }
            const payloadNotification = {
                title: temp,
                description: description,
                user_object: "collaborator",
                id_collaborator: collaborator._id,
                type_notification: "activity",
                related_id: address._id,
                id_address: address._id
            }
            await newItem.save();
            console.log('newItem', newItem)
            this.notificationSystemService.newActivity(payloadNotification);
            return true;
        } catch (err) {
            // this.logger.error(err.response || err.toString());
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }
    async collaboratorsetDefaultAddress(collaborator, address) {
        try {
            const temp = {
                vi: `CTV cài đặt địa chỉ mặc định`,
                en: `Collaborator set default address`
            }
            const temp2 = `${collaborator._id} cài đặt ${address._id} làm địa chỉ mặc định`
            const newItem = new this.historyActivityModel({
                id_collaborator: collaborator._id,
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "collaborator_set_default_address",
                date_create: new Date(Date.now()).toISOString(),
                value_string: address.address,
                id_address: address._id
            })
            const description = {
                vi: `${collaborator._id} vừa xoá ${address._id}`,
                en: ``
            }
            const payloadNotification = {
                title: temp,
                description: description,
                user_object: "collaborator",
                id_collaborator: collaborator._id,
                type_notification: "activity",
                related_id: address._id,
                id_address: address._id
            }
            await newItem.save();
            console.log('newItem', newItem)
            this.notificationSystemService.newActivity(payloadNotification);
            return true;
        } catch (err) {
            // this.logger.error(err.response || err.toString());
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async editAccount(user) {
        try {
            const temp = {
                en: "Collaborator edit personal information successfully",
                vi: "Tài khoản đã chỉnh sửa thành công"
            }
            const temp2 = `${user._id} đã chỉnh sửa thành công tài khoản`

            const newItem = new this.historyActivityModel({
                id_customer: user._id,
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "collaborator_edit_personal_infor",
                date_create: new Date(Date.now()).toISOString()
            })
            await newItem.save();
            return true;
        } catch (err) {
            // this.logger.error(err.response || err.toString());
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async editProfile(user) {
        try {
            const temp = {
                en: "Collaborator edit profile successfully",
                vi: "Tài khoản đã chỉnh sửa profile thành công"
            }
            const temp2 = `${user._id} đã chỉnh sửa thành công profile`

            const newItem = new this.historyActivityModel({
                id_customer: user._id,
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "collaborator_edit_profile",
                date_create: new Date(Date.now()).toISOString()
            })
            await newItem.save();
            return true;
        } catch (err) {
            // this.logger.error(err.response || err.toString());
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }
    async deleteAccount(user) {
        try {
            const temp = {
                en: "Collaborator delete account successfully",
                vi: "Tài khoản đã xoá thành công"
            }
            const temp2 = `${user._id} đã xoá thành công tài khoản`

            const newItem = new this.historyActivityModel({
                id_collaborator: user._id,
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "collaborator_delete_account",
                date_create: new Date(Date.now()).toISOString()
            })
            await newItem.save();
            return true;
        } catch (err) {
            // this.logger.error(err.response || err.toString());
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async updateAministrative(user) {
        try {
            const temp = {
                en: "Collaborator edit location successfully",
                vi: "Profile đã chỉnh sửa vị trí thành công"
            }
            const temp2 = `${user._id} đã chỉnh sửa thành công vị trí`
            const newItem = new this.historyActivityModel({
                id_customer: user._id,
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "collaborator_update_aministrativ",
                date_create: new Date(Date.now()).toISOString()
            })
            await newItem.save();
            return true;
        } catch (err) {
            // this.logger.error(err.response || err.toString());
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async updateNetCollaborator(idUser, idOrder) {
        try {
            const getOrder = await this.orderModel.findById(idOrder);
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(idUser);
            let serviceFee = 0;
            for (const item of getOrder.service_fee) {
                serviceFee += Number(item['fee']);
            }
            getCollaborator.total_gross_income += Number(getOrder.initial_fee) + Number(serviceFee);
            getCollaborator.total_net_income += getOrder.final_fee;
            getCollaborator.total_job += 1;
            let discount = 0;
            if (getOrder.code_promotion) {
                getCollaborator.total_discount += getOrder.code_promotion['discount'];
                discount = getOrder.code_promotion['discount'];
            }
            if (getOrder.event_promotion.length > 0) {
                for (const item of getOrder.event_promotion) {
                    getCollaborator.total_discount += item['discount'];
                    discount += item['discount'];
                }
            }
            getCollaborator.total_collaborator_fee += getOrder.net_income_collaborator;
            getCollaborator.total_service_fee += getOrder.platform_fee;
            getCollaborator.total_net_income_of_business += Number(getOrder.platform_fee) - Number(discount);
            getCollaborator.percent_income = Number(getCollaborator.total_net_income_of_business / getCollaborator.total_gross_income) * 100;
            const collaborator = await this.collaboratorRepositoryService.findByIdAndUpdate(getCollaborator._id, getCollaborator)
            return collaborator;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async refundPlatformMoney(collaborator, platform_fee, groupOrder, service, order, previousBalance: previousBalanceCollaboratorDTO) {
        try {
            const temp = {
                vi: `Hoàn phí dịch vụ công việc ${order.id_view}`,
                en: `Refund service fee from work ${order.id_view}`
            }

            const formatMoney = await this.generalHandleService.formatMoney(platform_fee);
            const temp2 = `${collaborator._id} được hoàn ${formatMoney} phí dịch vụ từ công việc ${groupOrder._id.toString()}`
            const newItem = new this.historyActivityModel({
                id_collaborator: collaborator._id,
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "collaborator_refund_platform_fee",
                date_create: new Date(Date.now()).toISOString(),
                value: platform_fee,
                id_group_order: groupOrder._id,

                current_remainder: collaborator.remainder,
                status_current_remainder: (previousBalance.remainder < collaborator.remainder) ?
                    "up" : (previousBalance.remainder > collaborator.remainder) ? "down" : "none",
                current_gift_remainder: collaborator.gift_remainder,
                status_current_gift_remainder: (previousBalance.gift_remainder < collaborator.gift_remainder) ?
                    "up" : (previousBalance.gift_remainder > collaborator.gift_remainder) ? "down" : "none",


                current_work_wallet: collaborator.work_wallet,
                status_current_work_wallet: (previousBalance.work_wallet < collaborator.work_wallet) ?
                    "up" : (previousBalance.work_wallet > collaborator.work_wallet) ? "down" : "none",
                current_collaborator_wallet: collaborator.collaborator_wallet,
                status_current_collaborator_wallet: (previousBalance.collaborator_wallet < collaborator.collaborator_wallet) ?
                    "up" : (previousBalance.collaborator_wallet > collaborator.collaborator_wallet) ? "down" : "none",
            })
            const description = {
                vi: `Bạn đã được hoàn ${formatMoney}`,
                en: `You have been refunded ${formatMoney}`
            }
            const payloadNotification = {
                title: temp,
                description: description,
                user_object: "collaborator",
                id_collaborator: collaborator._id,
                type_notification: "activity",
                related_id: groupOrder._id,
                id_group_order: groupOrder._id
            }
            await newItem.save();
            this.notificationSystemService.newActivity(payloadNotification);
            const totalRefund = (groupOrder.payment_method === "cash") ?
                order.platform_fee + order.pending_money : order.platform_fee;
            const formatTotalRefund = await this.generalHandleService.formatMoney(totalRefund);
            const body = `Bạn đã được hoàn ${formatTotalRefund} từ công việc đã bị huỷ`

            const arrDeviceToken = await this.deviceTokenModel.find({ user_id: collaborator._id, user_object: "collaborator" })
            if (arrDeviceToken.length > 0) {
                const payload = {
                    title: temp.vi,
                    body: description.vi,
                    token: [arrDeviceToken[0].token],
                    data: { link: "guvipartner://Wallet" }

                }
                for (let i = 1; i < arrDeviceToken.length; i++) {
                    payload.token.push(arrDeviceToken[i].token)
                }
                this.notificationService.send(payload)
            }
            return true;
        } catch (err) {
            // this.logger.error(err.response || err.toString());
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }


    async refundMoney(collaborator, refundMoney, groupOrder, service, order, previousBalance) {
        try {
            const temp = {
                vi: `Hoàn tiền thu hộ từ công việc ${service.title.vi}`,
                en: `Refund money from work ${service.title.en}`
            }
            const formatMoney = await this.generalHandleService.formatMoney(refundMoney);
            const temp2 = `Hoàn tiền thu hộ cho CTV ${collaborator._id} thêm ${formatMoney} từ đơn hàng ${order._id}`
            const newItem = new this.historyActivityModel({
                id_collaborator: collaborator._id,
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "collaborator_refund_pending_money",
                date_create: new Date(Date.now()).toISOString(),
                value: refundMoney,
                id_order: order._id,
                id_group_order: groupOrder._id,
                current_remainder: collaborator.remainder,
                status_current_remainder: (previousBalance.remainder < collaborator.remainder) ?
                    "up" : (previousBalance.remainder > collaborator.remainder) ? "down" : "none",
                current_gift_remainder: collaborator.gift_remainder,
                status_current_gift_remainder: (previousBalance.gift_remainder < collaborator.gift_remainder) ?
                    "up" : (previousBalance.gift_remainder > collaborator.gift_remainder) ? "down" : "none",
            })

            const description = {
                vi: `Hoàn tiền thu hộ ${formatMoney} từ công việc ${service.title.vi}`,
                en: `Refund money ${formatMoney} from work ${service.title.en}`
            }
            const payloadNotification = {
                title: temp,
                description: description,
                user_object: "collaborator",
                id_collaborator: collaborator._id,
                type_notification: "activity",
                related_id: order._id,
                id_order: order._id,
                id_group_order: groupOrder._id
            }
            await newItem.save();
            this.notificationSystemService.newActivity(payloadNotification);
            return true;
        } catch (err) {
            // this.logger.error(err.response || err.toString());
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async adminContactedCollaborator(collaborator, idAdmin) {
        try {
            const temp = {
                vi: `Admin đã liên hệ CTV ${collaborator.id_view}`,
                en: `Admin contacted CTV ${collaborator.id_view}`
            }

            const temp2 = `${idAdmin} đã liên hệ CTV ${collaborator.id_view}`
            const newItem = new this.historyActivityModel({
                id_collaborator: collaborator._id,
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "admin_contacted_collaborator",
                date_create: new Date(Date.now()).toISOString(),
                id_admin_action: idAdmin
            })
            await newItem.save();

            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }


    async penaltyCancelOrderCollaborator(collaborator: CollaboratorDocument, money, idGroupOrder, order, previousBalance: previousBalanceCollaboratorDTO, punishTicket, timeCancelJob) {
        try {
            const temp = {
                vi: `Phạt huỷ ca đơn khách ${order.name_customer}`,
                en: `Penalty for cancel job ${order.name_customer}`
            }
            const formatMoney = await this.generalHandleService.formatMoney(money);
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(collaborator._id);
            const temp2 = `${collaborator._id} bị trừ tiền ${formatMoney} vì huỷ việc ${order._id}`
            const newItem = await this.historyRepositoryService.create({
                id_collaborator: collaborator._id,
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "punish_collaborator",
                date_create: new Date(Date.now()).toISOString(),
                id_group_order: idGroupOrder,
                id_order: order,
                value: -money,
                id_punish_ticket: punishTicket._id,
                id_transaction: punishTicket.id_transaction,
                current_work_wallet: getCollaborator.work_wallet,
                status_current_work_wallet: (previousBalance.work_wallet < getCollaborator.work_wallet) ?
                    "up" : (previousBalance.work_wallet > getCollaborator.work_wallet) ? "down" : "none",

                current_collaborator_wallet: Number(getCollaborator.collaborator_wallet),
                status_current_collaborator_wallet: (previousBalance.collaborator_wallet < Number(getCollaborator.collaborator_wallet)) ?
                    "up" : (previousBalance.collaborator_wallet > Number(getCollaborator.collaborator_wallet)) ? "down" : "none",
            });

            const title = {
                vi: `❗ GUVI Partner`,
                en: `❗ GUVI Partner`
            }

            let description = {
                vi: ``,
                en: ``
            }
            if (timeCancelJob < 2 * MILLISECOND_IN_HOUR) {
                description = {
                    vi: `Bạn bị phạt ${formatMoney} do "Hủy" ca làm ${order.id_view} trước giờ làm 2 tiếng.\n 👉 Nhấn để xem chi tiết !!!`,
                    en: `You are fined ${formatMoney} for "Cancel" shift ${order.id_view} 2 hours before work time.\n 👉 Click to see details !!!`
                }
            } else if (timeCancelJob < 8 * MILLISECOND_IN_HOUR) {
                description = {
                    vi: `Bạn bị phạt ${formatMoney} do "Hủy" ca làm ${order.id_view} trước giờ làm 8 tiếng.\n 👉 Nhấn để xem chi tiết !!!`,
                    en: `You are fined ${formatMoney} for "Cancel" shift ${order.id_view} 8 hours before work time.\n 👉 Click to see details !!!`
                }
            } else {
                description = {
                    vi: `Bạn bị phạt ${formatMoney} do "Hủy" ca làm ${order.id_view}.\n 👉 Nhấn để xem chi tiết !!!`,
                    en: `You are fined ${formatMoney} for "Cancel" shift ${order.id_view}.\n 👉 Click to see details !!!`
                }
            }
            const payloadNotification = {
                title: title,
                description: description,
                user_object: "collaborator",
                id_collaborator: collaborator._id,
                type_notification: "system",
                related_id: idGroupOrder,
                id_group_order: idGroupOrder
            }
            await newItem.save();
            this.notificationSystemService.newActivity(payloadNotification);
            const body = `Bạn bị trừ ${formatMoney} vì huỷ ca làm. Cố gắng đừng huỷ việc bạn nhé`

            const arrDeviceToken = await this.deviceTokenModel.find({ user_id: collaborator._id, user_object: "collaborator" })
            if (arrDeviceToken.length > 0) {
                const payload = {
                    title: title.vi,
                    body: description.vi,
                    token: [arrDeviceToken[0].token],
                    data: { link: "guvipartner://Wallet" }

                }
                for (let i = 1; i < arrDeviceToken.length; i++) {
                    payload.token.push(arrDeviceToken[i].token)
                }
                this.notificationService.send(payload)
            }

            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    /////////////////////////////////////// Infor_Test_Collaborator //////////////////////////////////////

    async submitTest(collaborator, examtest) {
        try {
            const temp = {
                vi: `CTV vừa nộp bài`,
                en: `Collaborator submit`
            }
            const temp2 = `${collaborator._id} vừa nộp bài ${examtest._id}`
            const newItem = new this.historyActivityModel({
                id_collaborator: collaborator._id,
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "collaborator_submit_test",
                date_create: new Date(Date.now()).toISOString(),
                value_string: examtest.examtest,
                id_examtest: examtest._id
            })

            await newItem.save();
            return true;
        } catch (err) {
            // this.logger.error(err.response || err.toString());
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async receiveBonusMoney(collaborator, bonusMoney, order, service, idGroupOrder, previousBalance) {
        try {
            const temp = {
                vi: `Thưởng thêm tiền từ công việc ${service.title.vi}`,
                en: `Get bonus money from work ${service.title.en}`
            }
            const formatBonusMoney = await this.generalHandleService.formatMoney(bonusMoney);
            const temp2 = `${collaborator._id} được nhận ${formatBonusMoney} từ đơn hàng ${order._id}`
            const newItem = new this.historyActivityModel({
                id_collaborator: collaborator._id,
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "collaborator_receive_bonus_money",
                date_create: new Date(Date.now()).toISOString(),
                value: bonusMoney,
                id_order: order._id,
                id_group_order: idGroupOrder,
                current_remainder: collaborator.remainder,
                status_current_remainder: (previousBalance.remainder < collaborator.remainder) ?
                    "up" : (previousBalance.remainder > collaborator.remainder) ? "down" : "none",
                current_gift_remainder: collaborator.gift_remainder,
                status_current_gift_remainder: (previousBalance.gift_remainder < collaborator.gift_remainder) ?
                    "up" : (previousBalance.gift_remainder > collaborator.gift_remainder) ? "down" : "none",
            })
            const description = {
                vi: `Thưởng thêm ${formatBonusMoney} từ công việc ${service.title.vi}`,
                en: `Get revice ${formatBonusMoney} from ${service.title.en}`
            }
            const payloadNotification = {
                title: temp,
                description: description,
                user_object: "collaborator",
                id_collaborator: collaborator._id,
                type_notification: "activity",
                related_id: order._id,
                id_order: order._id
            }
            await newItem.save();
            this.notificationSystemService.newActivity(payloadNotification);
            const arrDeviceToken = await this.deviceTokenModel.find({ user_id: collaborator._id, user_object: "collaborator" })
            if (arrDeviceToken.length > 0) {
                const payload = {
                    title: temp.vi,
                    body: description.vi,
                    token: [arrDeviceToken[0].token],
                    data: { link: "guvipartner://Wallet" }

                }
                for (let i = 1; i < arrDeviceToken.length; i++) {
                    payload.token.push(arrDeviceToken[i].token)
                }
                this.notificationService.send(payload)
            }
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    /// start tip collaborator
    async tipCollaborator(collaborator, tipMoney, order, service, idGroupOrder, previousBalance) {
        try {
            const temp = {
                vi: `Thưởng thêm tiền từ công việc ${service.title.vi}`,
                en: `Get bonus money from work ${service.title.en}`
            }
            const formatTipMoney = await this.generalHandleService.formatMoney(tipMoney);
            const temp2 = `${collaborator._id} được nhận ${formatTipMoney} từ đơn hàng ${order._id}`
            const newItem = new this.historyActivityModel({
                id_collaborator: collaborator._id,
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "customer_tip_collaborator",
                date_create: new Date(Date.now()).toISOString(),
                value: tipMoney,
                id_order: order._id,
                id_group_order: idGroupOrder,
                current_remainder: collaborator.remainder,
                status_current_remainder: (previousBalance.remainder < collaborator.remainder) ?
                    "up" : (previousBalance.remainder > collaborator.remainder) ? "down" : "none",
                current_gift_remainder: collaborator.gift_remainder,
                status_current_gift_remainder: (previousBalance.gift_remainder < collaborator.gift_remainder) ?
                    "up" : (previousBalance.gift_remainder > collaborator.gift_remainder) ? "down" : "none",
            })
            const description = {
                vi: `Khách hàng Thưởng thêm ${formatTipMoney} từ công việc ${service.title.vi}`,
                en: `Customer tip ${formatTipMoney} from ${service.title.en}`
            }
            const payloadNotification = {
                title: temp,
                description: description,
                user_object: "collaborator",
                id_collaborator: collaborator._id,
                type_notification: "activity",
                related_id: order._id,
                id_order: order._id
            }
            await newItem.save();
            this.notificationSystemService.newActivity(payloadNotification);
            const arrDeviceToken = await this.deviceTokenModel.find({ user_id: collaborator._id, user_object: "collaborator" })
            if (arrDeviceToken.length > 0) {
                const payload = {
                    title: temp.vi,
                    body: description.vi,
                    token: [arrDeviceToken[0].token],
                    data: { link: "guvipartner://Wallet" }
                }
                for (let i = 1; i < arrDeviceToken.length; i++) {
                    payload.token.push(arrDeviceToken[i].token)
                }
                this.notificationService.send(payload)
            }
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }
    /// end tip collaborator

    /**
     * 
     * @param idCollaborator id cộng tác viên
     * @param money số tiền
     * @param previousBalance số dư trước khi thực hiện hành động 
     * @param payment_in tên ví mà số tiền được chuyển vào
     * @returns 
     */
    async collaboratorChangeMoneyWallet(idCollaborator, money, previousBalance, payment_in = 'work_wallet') {
        try {
            const tempWallet = {
                en: 'the work wallet',
                vi: 'ví công việc'
            }
            if (payment_in === 'collaborator_wallet') {
                tempWallet.en = 'the collaborator wallet'
                tempWallet.vi = 'ví cộng tác viên'
            }
            const formatMoney = await this.generalHandleService.formatMoney(money);
            const title = {
                vi: `Bạn đã chuyển ${formatMoney} sang ${tempWallet.vi} thành công.`,
                en: `The transfer of ${formatMoney} to ${tempWallet.en} was successful.`
            }
            const body = {
                vi: `Bạn đã chuyển ${formatMoney} sang ${tempWallet.vi} thành công.\n Bạn có thể kiểm tra lại trong phần lịch sử tài khoản bạn nhé!!!`,
                en: `The transfer of ${formatMoney} to ${tempWallet.en} was successful.\n You can check it again in the account history section.`
            }
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(idCollaborator);
            const title_admin = `${getCollaborator._id} đã chuyển ${formatMoney} sang ${tempWallet.vi}`;
            const newItem = new this.historyActivityModel({
                id_collaborator: idCollaborator,
                title: title,
                title_admin: title_admin,
                body: body,
                type: "collaborator_change_money_wallet",
                date_create: new Date(Date.now()).toISOString(),
                value: money,
                current_work_wallet: Number(getCollaborator.work_wallet),
                status_current_work_wallet: (previousBalance.work_wallet < getCollaborator.work_wallet) ?
                    "up" : (previousBalance.work_wallet > getCollaborator.work_wallet) ? "down" : "none",
                current_collaborator_wallet: Number(getCollaborator.collaborator_wallet),
                status_current_collaborator_wallet: (previousBalance.collaborator_wallet < Number(getCollaborator.collaborator_wallet)) ?
                    "up" : (previousBalance.collaborator_wallet > Number(getCollaborator.collaborator_wallet)) ? "down" : "none",
            })
            await newItem.save();

            const payloadNotification = {
                title: title,
                description: body,
                user_object: "collaborator",
                id_collaborator: idCollaborator,
                type_notification: "activity",
            }
            await newItem.save();
            this.notificationSystemService.newActivity(payloadNotification);
            const arrDeviceToken = await this.deviceTokenModel.find({ user_id: idCollaborator, user_object: "collaborator" })
            if (arrDeviceToken.length > 0) {
                const payload = {
                    title: title.vi,
                    body: body.vi,
                    token: [arrDeviceToken[0].token],
                    data: { link: "guvipartner://" }
                }
                for (let i = 1; i < arrDeviceToken.length; i++) {
                    payload.token.push(arrDeviceToken[i].token)
                }
                this.notificationService.send(payload)
            }
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async balanceMoney(idCollaborator, money, previousBalance) {
        try {

            const formatMoney = await this.generalHandleService.formatMoney(money);
            const title = {
                vi: `Hế thống đã chuyển ${formatMoney} sang ví công việc thành công.`,
                en: `System transfered ${formatMoney} to the work wallet successful.`
            }
            const body = {
                vi: `Hệ thống tự cân bằng số dư thành công. \nBạn có thể kiểm tra lại trong phần lịch sử tài khoản bạn nhé!!!`,
                en: `System transfered ${formatMoney} to the work wallet successful.\n You can check it again in the account history section.`
            }
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(idCollaborator);
            const title_admin = `Đã cân bằng số dư thành công`;
            const newItem = this.historyRepositoryService.create({
                id_collaborator: idCollaborator,
                title: title,
                title_admin: title_admin,
                body: body,
                type: "system_balance_money",
                date_create: new Date(Date.now()).toISOString(),
                value: money,
                current_work_wallet: Number(getCollaborator.work_wallet),
                status_current_work_wallet: (previousBalance.work_wallet < getCollaborator.work_wallet) ?
                    "up" : (previousBalance.work_wallet > getCollaborator.work_wallet) ? "down" : "none",
                current_collaborator_wallet: Number(getCollaborator.collaborator_wallet),
                status_current_collaborator_wallet: (previousBalance.collaborator_wallet < Number(getCollaborator.collaborator_wallet)) ?
                    "up" : (previousBalance.collaborator_wallet > Number(getCollaborator.collaborator_wallet)) ? "down" : "none",
            })

            const payloadNotification = {
                title: title,
                description: body,
                user_object: "collaborator",
                id_collaborator: idCollaborator,
                type_notification: "activity",
            }
            this.notificationSystemService.newActivity(payloadNotification);
            const arrDeviceToken = await this.deviceTokenModel.find({ user_id: idCollaborator, user_object: "collaborator" })
            if (arrDeviceToken.length > 0) {
                const payload = {
                    title: title.vi,
                    body: body.vi,
                    token: [arrDeviceToken[0].token],
                    data: { link: "guvipartner://" }
                }
                for (let i = 1; i < arrDeviceToken.length; i++) {
                    payload.token.push(arrDeviceToken[i].token)
                }
                this.notificationService.send(payload)
            }
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async collaboratorPunishedTicket(collaborator, money, previousBalance, getTicket, admin?) {
        try {
            const formatMoney = await this.generalHandleService.formatMoney(money);
            const title = {
                vi: `Bạn đã bị phạt ${formatMoney} vì ${getTicket.title.vi}.`,
                en: `You have been penalized ${formatMoney} for ${getTicket.title.en}.`
            }
            const body = {
                vi: `Bạn đã bị phạt ${formatMoney} vì ${getTicket.title.vi}.`,
                en: `You have been penalized ${formatMoney} for ${getTicket.title.en}.`
            }
            const getCollaborator = collaborator;
            const title_admin = `${getCollaborator._id} đã bị phạt ${formatMoney} vì ${getTicket.title.vi} `;
            const newItem = new this.historyActivityModel({
                id_collaborator: collaborator._id,
                id_admin_action: admin?._id,
                id_punish_ticket: getTicket._id,
                id_order: getTicket.id_order,
                id_transaction: getTicket.id_transaction,
                title: title,
                title_admin: title_admin,
                body: body,
                type: "collaborator_punished_by_ticket",
                date_create: new Date(Date.now()).toISOString(),
                value: money,
                current_work_wallet: Number(getCollaborator.work_wallet),
                status_current_work_wallet: (previousBalance.work_wallet < getCollaborator.work_wallet) ?
                    "up" : (previousBalance.work_wallet > getCollaborator.work_wallet) ? "down" : "none",
                current_collaborator_wallet: Number(getCollaborator.collaborator_wallet),
                status_current_collaborator_wallet: (previousBalance.collaborator_wallet < Number(getCollaborator.collaborator_wallet)) ?
                    "up" : (previousBalance.collaborator_wallet > Number(getCollaborator.collaborator_wallet)) ? "down" : "none",
            })
            await newItem.save();

            const payloadNotification = {
                title: title,
                description: body,
                user_object: "collaborator",
                id_collaborator: collaborator._id,
                type_notification: "activity",
            }
            await newItem.save();
            this.notificationSystemService.newActivity(payloadNotification);
            const arrDeviceToken = await this.deviceTokenModel.find({ user_id: collaborator._id, user_object: "collaborator" })
            if (arrDeviceToken.length > 0) {
                const payload = {
                    title: title.vi,
                    body: body.vi,
                    token: [arrDeviceToken[0].token],
                    data: { link: "guvipartner://" }
                }
                for (let i = 1; i < arrDeviceToken.length; i++) {
                    payload.token.push(arrDeviceToken[i].token)
                }
                this.notificationService.send(payload)
            }
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async revokePunishTicket(collaborator, previousBalance, getTransaction, punishTicket, admin) {
        try {
            // const messageBackup = {
            //     vi: `Lệnh phạt ${getTransaction.id_view} đã được thu hồi và hoàn tiền`,
            //     en: `The ${getTransaction.id_view} penalty has been revoked and refunded`
            // }
            const message = {
                vi: `Lệnh phạt ${punishTicket.id_view} đã được thu hồi và hoàn tiền`,
                en: `The ${punishTicket.id_view} penalty has been revoked and refunded`
            }
            const temp = `Lệnh phạt ${getTransaction.id_view} đã được thu hồi và hoàn tiền bởi ${admin._id}`;
            const item = await this.historyRepositoryService.create({
                id_collaborator: collaborator._id,
                id_transaction: getTransaction._id,
                id_punish_ticket: getTransaction.id_punish_ticket,
                id_admin_action: admin._id,
                value: getTransaction.money,
                date_create: new Date(Date.now()).toISOString(),
                title: message,
                body: message,
                title_admin: temp,
                type: "revoke_punish_ticket",
                current_work_wallet: Number(collaborator.work_wallet),
                status_current_work_wallet: (previousBalance.work_wallet < collaborator.work_wallet) ?
                    "up" : (previousBalance.work_wallet > collaborator.work_wallet) ? "down" : "none",
                current_collaborator_wallet: Number(collaborator.collaborator_wallet),
                status_current_collaborator_wallet: (previousBalance.collaborator_wallet < Number(collaborator.collaborator_wallet)) ?
                    "up" : (previousBalance.collaborator_wallet > Number(collaborator.collaborator_wallet)) ? "down" : "none",
            })
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }
}
