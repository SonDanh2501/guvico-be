import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Collaborator, CollaboratorDocument, Customer, CustomerDocument, DeviceToken, DeviceTokenDocument, ERROR, Order, OrderDocument, Service, ServiceDocument, UserSystem, UserSystemDocument } from 'src/@core'
import { GroupOrder, GroupOrderDocument } from 'src/@core/db/schema/group_order.schema'
import { HistoryActivity, HistoryActivityDocument } from 'src/@core/db/schema/history_activity.schema'
import { HistoryOrder, HistoryOrderDocument } from 'src/@core/db/schema/history_order.schema'
import { ReasonCancel, ReasonCancelDocument } from 'src/@core/db/schema/reason_cancel.schema'
import { TransitionCustomer, TransitionCustomerDocument } from 'src/@core/db/schema/transition_customer.schema'
import { createHistoryActivityDTO } from 'src/@core/dto/historyActivity.dto'
import { createTransactionDTO } from 'src/@core/dto/transaction.dto'
import { TransactionDocument } from 'src/@repositories/module/mongodb/@database/schema/transaction.schema'
import { CustomerRepositoryService } from 'src/@repositories/repository-service/customer-repository/customer-repository.service'
import { HistoryActivityRepositoryService } from 'src/@repositories/repository-service/history-activity-repository/history-activity-repository.service'
import { TransactionRepositoryService } from 'src/@repositories/repository-service/transaction-repository/transaction-repository.service'
import { UserSystemRepositoryService } from 'src/@repositories/repository-service/user-system-repository/user-system-repository.service'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service'
import { NotificationService } from 'src/notification/notification.service'
import { CollaboratorSystemService } from '../collaborator-system/collaborator-system.service'
import { HistoryActivitySystemService } from '../history-activity-system/history-activity-system.service'
import { NotificationSystemService } from '../notification-system/notification-system.service'
import { PushNotiSystemService } from '../push-noti-system/push-noti-system.service'
import { TransactionSystemService } from '../transaction-system/transaction-system.service'

@Injectable()
export class ActivityCustomerSystemService {
    constructor(
        private customExceptionService: CustomExceptionService,
        private notificationService: NotificationService,
        private notificationSystemService: NotificationSystemService,
        private generalHandleService: GeneralHandleService,
        private pushNotiSystemService: PushNotiSystemService,
        private collaboratorSystemService: CollaboratorSystemService,
        private transactionRepositoryService: TransactionRepositoryService,
        private historyActivityRepositoryService: HistoryActivityRepositoryService,
        private transactionSystemService: TransactionSystemService,
        private historyActivitySystemService: HistoryActivitySystemService,
        private customerRepositoryService: CustomerRepositoryService,
        private userSystemRepositoryService: UserSystemRepositoryService,

        @InjectModel(HistoryOrder.name) private historyOrderModel: Model<HistoryOrderDocument>,
        @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
        @InjectModel(UserSystem.name) private userSystemModel: Model<UserSystemDocument>,
        @InjectModel(Collaborator.name) private collaboratorModel: Model<CollaboratorDocument>,
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @InjectModel(GroupOrder.name) private groupOrderModel: Model<GroupOrderDocument>,
        @InjectModel(DeviceToken.name) private deviceTokenModel: Model<DeviceTokenDocument>,
        @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
        @InjectModel(HistoryActivity.name) private historyActivityModel: Model<HistoryActivityDocument>,
        @InjectModel(TransitionCustomer.name) private transitionCustomerModel: Model<TransitionCustomerDocument>,
        @InjectModel(ReasonCancel.name) private reasonCancelModel: Model<ReasonCancelDocument>,
    ) { }


    async newAccount(idCustomer, pay_point) {
        try {
            const temp = {
                en: "User create is successfully",
                vi: "Tài khoản đã tạo thành công"
            }
            const getCustomer = await this.customerRepositoryService.findOneById(idCustomer);
            const temp2 = `${getCustomer._id} đã tạo thành công tài khoản `
            const newItem = new this.historyActivityModel({
                id_customer: getCustomer._id,
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "customer_create_new_account",
                date_create: new Date(Date.now()).toISOString()
            })
            await newItem.save();

            // const title_admin = `Khách hàng ${getCustomer._id} đã đồng ý với điều khoản sử dụng và chính sách bảo mật của GUVI`;
            const temp_title = {
                vi: `Khách hàng ${getCustomer._id} đã đồng ý với điều khoản sử dụng và chính sách bảo mật của GUVI`,
                en: `Customer ${getCustomer._id} has agreed to GUVI's terms of use and privacy policy`
            }
            const temp_admin = `Bạn đã đồng ý với điều khoản sử dụng và chính sách bảo mật của GUVI`
            const acceptPolicyActivity = new this.historyActivityModel({
                id_customer: getCustomer._id,
                title: temp_title,
                title_admin: temp_admin,
                body: temp_title,
                type: "customer_accept_policy",
                date_create: new Date(Date.now()).toISOString()
            })
            await acceptPolicyActivity.save();

            getCustomer.date_accept_policy = new Date(Date.now()).toISOString();
            // await getCustomer.save();
            this.customerRepositoryService.findByIdAndUpdate(getCustomer._id, getCustomer)

            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async editAccount(idCustomer) {
        try {
            const temp = {
                en: "User edit personal information successfully",
                vi: "Tài khoản đã chỉnh sửa thành công"
            }
            const getCustomer = await this.customerRepositoryService.findOneById(idCustomer);
            const temp2 = `${getCustomer._id} đã chỉnh sửa thành công tài khoản`

            const newItem = new this.historyActivityModel({
                id_customer: idCustomer.toString(),
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "customer_edit_personal_infor",
                date_create: new Date(Date.now()).toISOString()
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async deleteAccount(idCustomer) {
        try {
            const temp = {
                en: "User delete personal information successfully",
                vi: "Tài khoản đã xoá thành công"
            }
            const getCustomer = await this.customerRepositoryService.findOneById(idCustomer, {}, [], true);
            const temp2 = `${getCustomer.full_name} đã xoá thành công tài khoản`
            const newItem = new this.historyActivityModel({
                id_customer: idCustomer.toString(),
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "customer_delete_account",
                date_create: new Date(Date.now()).toISOString()
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);

        }
    }

    async createNewGroupOrder(idCustomer, idGroupOrder, idService) {
        try {

            const getCustomer = await this.customerRepositoryService.findOneById(idCustomer);
            const getService = await this.serviceModel.findById(idService);
            const getGroupOrder = await this.groupOrderModel.findById(idGroupOrder);
            const temp = {
                en: "Create order successfully",
                vi: "Tạo dịch vụ thành công"
            }
            let temp2 = `${getCustomer.full_name} đã tạo thành công dịch vụ ${getService.title.vi}`;
            const newItem = new this.historyActivityModel({
                id_customer: idCustomer.toString(),
                title: temp,
                body: temp,
                title_admin: temp2,
                type: "customer_create_group_order",
                id_group_order: idGroupOrder,
                date_create: new Date(Date.now()).toISOString(),

            })
            const title = {
                vi: `GUVI`,
                en: `GUVI`
            }
            const description = {
                vi: `GUVI đang tìm kiếm "Cộng tác viên" cho bạn. Nhấp để xem chi tiết`,
                en: `GUVI is looking for "Collaborators" for you. Click to see details`
            }
            const payloadNotification = {
                title: title,
                description: description,
                user_object: "customer",
                user_id: [idCustomer.toString()],
                id_customer: idCustomer.toString(),
                type_notification: "activity",
                related_id: idGroupOrder,
                id_group_order: idGroupOrder,
                id_order: getGroupOrder.id_order[0],
                type_schedule: getGroupOrder.type
            }
            await this.notificationSystemService.newActivity(payloadNotification);
            await newItem.save();
            if (getGroupOrder.id_customer) {
                const arrDeviceToken = await this.deviceTokenModel.find({ user_id: getGroupOrder.id_customer })
                if (arrDeviceToken.length > 0) {
                    const payload = {
                        title: title.vi,
                        body: description.vi,
                        data: { link: "guviapp://Activity" },
                        token: [arrDeviceToken[0].token]
                    }
                    for (let i = 1; i < arrDeviceToken.length; i++) {
                        payload.token.push(arrDeviceToken[i].token)
                    }
                    this.notificationService.send(payload)
                }
            }
            if (getGroupOrder.id_favourite_collaborator.length > 0) {
                const tempId = await this.collaboratorSystemService.collaboratorFavourite(getGroupOrder);
                if (tempId.length > 0) {
                    const payloadNoti = {
                        title: "🔥 Có công việc mới !!!",
                        body: "🤩 Có công việc mới hấp dẫn gần bạn \n👉 Nhấn để xem ngay nhé",
                        data: "guvipartner://",
                        user_id: tempId,
                        user_object: 'collaborator'
                    }
                    this.pushNotiSystemService.pushNotiMultipleUser(payloadNoti);
                }
            } else {
                const tempId = await this.collaboratorSystemService.collaboratorInDistrict(getGroupOrder);
                if (tempId.length > 0) {
                    const payloadNoti = {
                        title: "🔥 Có công việc mới !!!",
                        body: "🤩 Có công việc mới hấp dẫn gần bạn \n👉 Nhấn để xem ngay nhé",
                        data: "guvipartner://",
                        user_id: tempId,
                        user_object: 'collaborator'
                    }
                    this.pushNotiSystemService.pushNotiMultipleUser(payloadNoti);
                }
            }
            // if (groupOrder.id_favourite_collaborator.length > 0) {
            //     this.pushNotiSystemService.pushNotiCollaboratorFavorite(groupOrder)
            // } else {
            //     this.pushNotiSystemService.pushNotiCollaborator(groupOrder)
            // }
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async cancelOrder(idCustomer, idOrder, idGroupOrder, reasonCancel?) {
        try {
            const getCustomer = await this.customerRepositoryService.findOneById(idCustomer);
            const getOrder = await this.orderModel.findById(idOrder);

            const temp = {
                en: "Cancel order successfully",
                vi: "Huỷ công việc thành công"
            }
            let temp2 = `${getCustomer._id} đã huỷ công việc ${idOrder} với lý do "${getOrder.id_cancel_customer['id_reason_cancel']}"`;
            const newItem = new this.historyActivityModel({
                id_customer: idCustomer.toString(),
                title: temp,
                body: temp,
                title_admin: temp2,
                type: 'customer_cancel_order',
                id_order: idOrder,
                id_group_order: idGroupOrder,
                current_reputation_score: getCustomer.reputation_score,
                date_create: new Date(Date.now()).toISOString(),
                id_reason_cancel: getOrder.id_cancel_customer['id_reason_cancel']
            })
            if (getOrder.id_collaborator) {
                const arrDeviceToken = await this.deviceTokenModel.find({ user_id: getOrder.id_collaborator })
                if (arrDeviceToken.length > 0) {
                    const payload = {
                        title: "Công việc đã bị huỷ",
                        body: "Có 1 công việc bạn nhận đã bị huỷ bởi khách hàng",
                        data: { link: "guvipartner://" },
                        token: [arrDeviceToken[0].token]
                    }
                    for (let i = 1; i < arrDeviceToken.length; i++) {
                        payload.token.push(arrDeviceToken[i].token)
                    }
                    this.notificationService.send(payload)
                }
            }

            const title = {
                vi: `Hủy đơn thành công`,
                en: `Cancel order successful`
            }

            const description = {
                vi: `Bạn đã hủy công việc ${getOrder.id_view} với lý do "${reasonCancel.title.vi}".\n Nếu bạn cần hỗ trợ, vào "Tài khoản", chọn "Góp ý". Chúng tôi sẽ lắng nghe vấn đề của bạn và liên hệ lại bạn ngay khi nhận thông tin.`,
                en: `You canceled order ${getOrder.id_view} with reason "${reasonCancel.title.en}".\n If you need support, enter "Account" click "Feedback". We always listen for you problem and contact you as soon as we receive the information.`
            }
            const payloadNotiCustomer = {
                title,
                description,
                user_object: "customer",
                id_customer: getCustomer._id,
                type_notification: "activity",
                related_id: idOrder,
                id_group_order: idGroupOrder,
                id_order: idOrder
            }
            this.notificationSystemService.newActivity(payloadNotiCustomer);

            const arrDeviceToken = await this.deviceTokenModel.find({ user_id: getOrder.id_customer })
            if (arrDeviceToken.length > 0) {
                const payload = {
                    title: title.vi,
                    body: description.vi,
                    data: { link: "guviapp://" },
                    token: [arrDeviceToken[0].token]
                }
                for (let i = 1; i < arrDeviceToken.length; i++) {
                    payload.token.push(arrDeviceToken[i].token)
                }
                this.notificationService.send(payload)
            }
            await newItem.save();
            return true;
        } catch (err) {
            console.log(err);

            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async cancelGroupOrder(idCustomer, idGroupOrder, idCancel?) {
        try {
            const getReasonCancel = await this.reasonCancelModel.findById(idCancel);
            console.log(getReasonCancel, 'reason cancel');

            const getGroupOrder = await this.groupOrderModel.findById(idGroupOrder);
            const getCustomer = await this.customerRepositoryService.findOneById(idCustomer);
            const getService = await this.serviceModel.findById(getGroupOrder.service._id);
            const temp = {
                en: "Cancel order successfully",
                vi: "Huỷ dịch vụ thành công"
            }
            let temp2 = `${getCustomer._id} đã huỷ dịch vụ ${getService.title.vi}`;
            const newItem = new this.historyActivityModel({
                id_customer: idCustomer.toString(),
                title: temp,
                body: temp,
                title_admin: temp2,
                type: "customer_cancel_group_order",
                id_group_order: idGroupOrder,
                date_create: new Date(Date.now()).toISOString(),
                id_reason_cancel: getGroupOrder.id_cancel_customer
            })

            const title = {
                vi: `Hủy đơn thành công`,
                en: `Cancel order successfull`
            };
            const description = {
                vi: `Bạn đã hủy công việc ${getGroupOrder.id_view} với lý do "${getReasonCancel.title.vi}".\n Nếu bạn cần hỗ trợ, vào "Tài khoản", chọn "Góp ý". Chúng tôi sẽ lắng nghe vấn đề của bạn và liên hệ lại bạn ngay khi nhận thông tin.`,
                en: `You canceled order ${getGroupOrder.id_view} with reason "${getReasonCancel.title.en}".\n If you need support, enter "Account" click "Feedback". We always listen for you problem and contact you as soon as we receive the information.`
            }
            const payloadNotiCustomer = {
                title,
                description,
                user_object: "customer",
                id_customer: getCustomer._id,
                type_notification: "activity",
                related_id: idGroupOrder,
                id_group_order: idGroupOrder,
            }
            this.notificationSystemService.newActivity(payloadNotiCustomer);
            // Bắn noti cho CTV
            if (getGroupOrder.id_collaborator) {
                const arrDeviceToken = await this.deviceTokenModel.find({ user_id: getGroupOrder.id_collaborator })
                if (arrDeviceToken.length > 0) {
                    const payload = {
                        title: "Dịch vụ đã bị huỷ",
                        body: "Có 1 dịch vụ bạn nhận đã bị huỷ bởi khách hàng",
                        data: { link: "guvipartner://" },
                        token: [arrDeviceToken[0].token]
                    }
                    for (let i = 1; i < arrDeviceToken.length; i++) {
                        payload.token.push(arrDeviceToken[i].token)
                    }
                    this.notificationService.send(payload)
                }
            }
            // Bắn noti cho KH
            const arrDeviceToken = await this.deviceTokenModel.find({ user_id: getCustomer._id })
            if (arrDeviceToken.length > 0) {
                const payload = {
                    title: title.vi,
                    body: description.vi,
                    data: { link: "guviapp://" },
                    token: [arrDeviceToken[0].token]
                }
                for (let i = 1; i < arrDeviceToken.length; i++) {
                    payload.token.push(arrDeviceToken[i].token)
                }
                this.notificationService.send(payload)
            }
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async cancelGroupOrderV2(user, typeUserAction, getGroupOrder) {
        try {
            const getService = await this.serviceModel.findById(getGroupOrder.service._id);
            const temp = {
                en: "Cancel order successfully",
                vi: "Huỷ dịch vụ thành công"
            }
            let tempType: string = "";
            if (typeUserAction === "admin") {
                tempType = "admin_cancel_group_order";
            } else if (typeUserAction === "customer") {
                tempType = "customer_cancel_group_order";
            }
            const idCancel = (getGroupOrder.id_cancel_customer) ? getGroupOrder.id_cancel_customer.id_reason_cancel : getGroupOrder.id_cancel_user_system.id_reason_cancel;
            const getReasonCanel = await this.reasonCancelModel.findById(idCancel);

            const tempCancel = (typeUserAction === "customer") ? getGroupOrder.id_cancel_customer.id_reason_cancel : getGroupOrder.id_cancel_user_system.id_reason_cancel;
            let tempTitleAdmin = `${user._id} đã huỷ dịch vụ ${getService.title.vi} với lý do ${idCancel}`;
            const newItem = new this.historyActivityModel({
                id_customer: typeUserAction === "customer" ? user._id : null,
                id_admin_action: typeUserAction === "admin" ? user._id : null,
                title: temp,
                body: temp,
                title_admin: tempTitleAdmin,
                type: tempType,
                id_group_order: getGroupOrder._id,
                current_reputation_score: user.reputation_score,
                date_create: new Date(Date.now()).toISOString(),
                id_reason_cancel: idCancel
            });
            const title = {
                vi: `Hủy đơn thành công`,
                en: `Cancel order success`
            }
            const description = {
                vi: `Bạn đã hủy công việc ${getGroupOrder.id_view} với lý do "${getReasonCanel.title.vi}".\n Nếu bạn cần hỗ trợ, vào "Tài khoản", chọn "Góp ý". Chúng tôi sẽ lắng nghe vấn đề của bạn và liên hệ lại bạn ngay khi nhận thông tin.`,
                en: `You canceled job ${getGroupOrder.id_view} with reason "${getReasonCanel.title.en}". \n If you need support, go to "Account", select "Suggestions". We will listen to your problem and contact you as soon as we receive the information.`
            }
            const payloadNotiCustomer = {
                title,
                description,
                user_object: "customer",
                id_customer: getGroupOrder.id_customer,
                type_notification: "activity",
                related_id: getGroupOrder._id,
                id_group_order: getGroupOrder._id,
            }
            this.notificationSystemService.newActivity(payloadNotiCustomer);
            // Bắn noti cho CTV
            if (getGroupOrder.id_collaborator) {
                const arrDeviceToken = await this.deviceTokenModel.find({ user_id: getGroupOrder.id_collaborator })
                if (arrDeviceToken.length > 0) {
                    const payload = {
                        title: "Dịch vụ đã bị huỷ",
                        body: "Có 1 dịch vụ bạn nhận đã bị huỷ",
                        data: { link: "guvipartner://" },
                        token: [arrDeviceToken[0].token]
                    }
                    for (let i = 1; i < arrDeviceToken.length; i++) {
                        payload.token.push(arrDeviceToken[i].token)
                    }
                    this.notificationService.send(payload)
                }
            }
            //Bắn noti cho KH
            const arrDeviceToken = await this.deviceTokenModel.find({ user_id: getGroupOrder.id_customer })
            if (arrDeviceToken.length > 0) {
                const payload = {
                    title: title.vi,
                    body: description.vi,
                    data: { link: "guviapp://" },
                    token: [arrDeviceToken[0].token]
                }
                for (let i = 1; i < arrDeviceToken.length; i++) {
                    payload.token.push(arrDeviceToken[i].token)
                }
                this.notificationService.send(payload)
            }

            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async requestTopUpPayPoint(idCustomer, idTransfer, money) {
        try {
            const getCustomer = await this.customerRepositoryService.findOneById(idCustomer);
            const getTransfer = await this.transactionRepositoryService.findOneById(idTransfer);
            const temp = {
                en: "Request topup money succesfully",
                vi: "Yêu cầu nạp tiền của quý khách thành công"
            }
            let temp2 = `${getCustomer._id} đã yêu cầu nạp  ${money} VND`;
            const newItem = new this.historyActivityModel({
                id_customer: idCustomer.toString(),
                title: temp,
                body: temp,
                title_admin: temp2,
                type: "customer_request_top_up",
                value: Number(money),
                date_create: new Date(Date.now()).toISOString()
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async customerReceivcePointsByDoneOrder(idCustomer, idOrder, points, idGroupOrder, previousBalancePoints) {
        try {
            const getCustomer = await this.customerRepositoryService.findOneById(idCustomer);
            const getOrder = await this.orderModel.findById(idOrder);
            const temp = {
                en: `You got ${points} points`,
                vi: `Bạn đã được cộng ${points} điểm`
            }
            let temp2 = `${getCustomer.full_name} được cộng ${points} điểm từ đơn hàng ${getOrder.id_view}`;
            const newItem = new this.historyActivityModel({
                id_customer: idCustomer.toString(),
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "customer_collect_points_order",
                value: points,
                date_create: new Date(Date.now()).toISOString(),
                id_order: idOrder,
                current_reputation_score: getCustomer.reputation_score,
                id_group_order: idGroupOrder,
                current_point: getCustomer.point,
                status_current_point: 'up'
            })
            await newItem.save();
            const title = {
                vi: `GUVI`,
                en: `GUVI`
            }
            const description = {
                vi: `Đơn ${getOrder.id_view} đã hoàn thành. Bạn được cộng ${points} Gpoints.\n Sử dụng Gpoints để đổi nhiều phần quà và khuyến mãi hấp dẫn ngay tại đây !`,
                en: `Order ${getOrder.id_view} is completed. You are awarded ${points} Gpoints.\n Use Gpoints to redeem many attractive gifts and promotions right here`
            }
            const payloadNotiCustomer = {
                title,
                description,
                user_object: "customer",
                id_customer: getCustomer._id,
                type_notification: "system",
                related_id: idOrder,
                id_order: idOrder,
                id_group_order: idGroupOrder,
            }
            this.notificationSystemService.newActivity(payloadNotiCustomer);
            const arrDeviceToken = await this.deviceTokenModel.find({ user_id: idCustomer })
            if (arrDeviceToken.length > 0) {
                const payload = {
                    title: title.vi,
                    body: description.vi,
                    token: [arrDeviceToken[0].token]
                }
                for (let i = 1; i < arrDeviceToken.length; i++) {
                    payload.token.push(arrDeviceToken[i].token)
                }
                this.notificationService.send(payload)
            }
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async customerRedeemPointsByPromotion(idCustomer, idPromotion, points, previousPoint) {
        try {
            const getCustomer = await this.customerRepositoryService.findOneById(idCustomer);
            const temp = {
                en: `Redeemed ${points} points successfully `,
                vi: `Quy đổi thành công ${points} điểm`
            }
            let temp2 = `${getCustomer._id} quy đổi ${points} điểm cho khuyến mãi ${idPromotion}`;
            const newItem = new this.historyActivityModel({
                id_customer: idCustomer.toString(),
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "customer_exchange_points_promotion",
                value: -points,
                date_create: new Date(Date.now()).toISOString(),
                id_promotion: idPromotion,
                current_point: getCustomer.point,
                status_current_point: "down"
            })
            await newItem.save();

            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async refundPayPointV2(idCustomer, money, getGroupOrder, order?, previousPaypoint?) {
        try {
            const getCustomer = await this.customerRepositoryService.findOneById(idCustomer);
            const formatMoney = await this.generalHandleService.formatMoney(money);
            const payloadCreateTransaction: createTransactionDTO = {
                id_customer: idCustomer,
                status: 'done',
                date_verify: new Date(Date.now()).toISOString(),
                type_transfer: 'refund_service',
                id_order: order ? order._id : null,
                id_group_order: getGroupOrder._id,
                money: Number(money),
                subject: 'customer',
                payment_out: 'cash_book',
                payment_in: "pay_point"
            }
            const newTrans = await this.transactionSystemService.createItem(payloadCreateTransaction);
            const temp = {
                en: `You is refund ${formatMoney} successfully`,
                vi: `Bạn được hoàn lại ${formatMoney}`
            }
            let temp2 = `Tài khoản ${getCustomer._id} đã được nhận lại ${formatMoney} cho công việc bị huỷ`;
            const payloadHistory: createHistoryActivityDTO = {
                value: Number(money),
                id_transaction: newTrans._id,
                title: temp,
                title_admin: temp2,
                body: temp,
                id_customer: idCustomer.toString(),
                type: "customer_refund_pay_point",
                id_group_order: getGroupOrder._id,
                id_order: (order) ? order._id : null,
                current_pay_point: getCustomer.pay_point,
                status_current_pay_point: "up",
                date_create: new Date(Date.now()).toISOString()
            }
            this.historyActivityRepositoryService.create(payloadHistory)
            const title = {
                vi: `Hoàn tiền thành công`,
                en: `Refund money success`
            }

            const description = {
                vi: `Bạn đã được hoàn ${formatMoney} vào ví Gpay do đơn ${getGroupOrder.id_view} bị hủy`,
                en: `You have been refunded ${formatMoney} to Gpay wallet because order test was canceled`
            }
            const payloadNotiCustomer = {
                title,
                description,
                user_object: "customer",
                id_customer: getCustomer._id,
                type_notification: "activity",
                related_id: getGroupOrder._id,
                id_group_order: getGroupOrder._id,
            }
            this.notificationSystemService.newActivity(payloadNotiCustomer);
            const arrDeviceToken = await this.deviceTokenModel.find({ user_id: getCustomer._id, user_object: "customer" })
            if (arrDeviceToken.length > 0) {
                const payload = {
                    title: title.vi,
                    body: description.vi,
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
            console.log(err);
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    // tạo đơn hàng thanh toán = pay Point 
    // NOOOOOOOO
    async paymentMethodPayPoint(customer, groupOrder, payPoint) {
        try {
            const temp = {
                en: "Customer have paid successfully your order",
                vi: "Khách hàng đã thanh toán thành công đơn hàng"
            }
            let temp2 = `Thu phí ${payPoint} VND thành công cho đơn hàng ${groupOrder._id}`;
            const newItem = new this.historyActivityModel({
                id_customer: customer._id,
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "customer_paid_pay_point",
                id_group_order: groupOrder._id,
                date_create: new Date(Date.now()).toISOString(),
                value: Number(payPoint)
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async paymentMethodPayPointV2(customer, groupOrder, payPoint) {
        try {
            const temp = {
                en: "Customer have paid successfully your order",
                vi: "Khách hàng đã thanh toán thành công đơn hàng"
            }
            let temp2 = `Thu phí ${payPoint} VND thành công cho đơn hàng ${groupOrder._id}`;
            const newItem = new this.historyActivityModel({
                id_customer: customer._id,
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "customer_paid_pay_point",
                id_group_order: groupOrder._id,
                date_create: new Date(Date.now()).toISOString(),
                value: Number(payPoint)
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async setDefaultAddress(customer, result) {
        try {
            const temp = {
                en: "Customer have set successfully your default address",
                vi: "Khách hàng đã cài đặt địa chỉ mặc định thành công"
            }
            let temp2 = `Khách hàng ${customer._id} đã cài đặt ${result._id} thành công `;
            const newItem = new this.historyActivityModel({
                id_customer: customer._id,
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "customer_set_default_address",
                id_address: result._id,
                date_create: new Date(Date.now()).toISOString(),
                value_string: result.address
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    async setIsDefaultAddress(customer, result) {
        try {
            const temp = {
                en: "Customer have set successfully your is default address",
                vi: "Khách hàng đã cài đặt địa chỉ mặc định thành công"
            }
            let temp2 = `Khách hàng ${customer._id} đã cài đặt ${result._id} thành công `;
            const newItem = new this.historyActivityModel({
                id_customer: customer._id,
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "customer_set_is_default_address",
                id_address: result._id,
                date_create: new Date(Date.now()).toISOString(),
                value_string: result.address
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    async deleteAddress(customer, result) {
        try {
            const temp = {
                en: "Customer have delete successfully your is default address",
                vi: "Khách hàng đã xoá địa chỉ  thành công"
            }
            let temp2 = `Khách hàng ${customer._id} đã xoá ${result._id} thành công `;
            const newItem = new this.historyActivityModel({
                id_customer: customer._id,
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "customer_delete_default_address",
                id_address: result._id,
                date_create: new Date(Date.now()).toISOString(),
                value_string: result.address
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    async editAddress(customer, result) {
        try {
            const temp = {
                en: "Customer have edit successfully your is default address",
                vi: "Khách hàng đã sửa địa chỉ mặc định thành công"
            }
            let temp2 = `Khách hàng ${customer._id} đã sửa ${result._id} thành công `;
            const newItem = new this.historyActivityModel({
                id_customer: customer._id,
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "customer_edit_default_address",
                id_address: result._id,
                date_create: new Date(Date.now()).toISOString(),
                value_string: result.address
            })
            await newItem.save();
            return true;
        } catch (err) {
            // this.logger.error(err.response || err.toString());
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async newFeedback(idCustomer, idFeedBack) {
        try {
            const temp = {
                en: "User create feedback successfully",
                vi: "Khách hàng đã tạo feedback thành công"
            }
            const temp2 = `${idCustomer} đã tạo thành công ${idFeedBack}`
            const newItem = new this.historyActivityModel({
                id_customer: idCustomer.toString(),
                id_feedback: idFeedBack,
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "customer_create_new_feedback",
                date_create: new Date(Date.now()).toISOString()
            })
            await newItem.save();

            const description = {
                vi: "Chúng tôi đã tiếp nhận thông tin và ý kiến đóng góp. Từ phía đội ngũ phát triển, chúng tôi gửi lời cảm ơn sâu sắc và sẽ lắng nghe từ bạn.\n Chúng tôi sẽ cải thiện chất lượng dịch vụ và sản phẩm từ sự chân thành và thẳng thắn này",
                en: "We have received information and comments. From the development team, we thank you deeply and will listen to you.\n We will improve service and product quality from this sincerity and frankness."
            }

            const arrDeviceToken = await this.deviceTokenModel.find({ user_id: idCustomer })
            if (arrDeviceToken.length > 0) {
                const payload = {
                    title: "GUVI",
                    body: description.vi,
                    data: { link: "guviapp://" },
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
    async customerAddCodeInviter(idCustomer, idCode, idInviter) {
        try {
            const temp = {
                en: "User apply invite code successfully",
                vi: "Khách hàng đã áp mã mời sử dụng app thành công"
            }
            const temp2 = `${idCustomer} đã sử dụng thành công mã ${idCode} từ ${idInviter}`
            const newItem = new this.historyActivityModel({
                id_customer: idCustomer.toString(),
                id_code: idCode,
                id_inviter: idInviter,
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "customer_apply_invite_code",
                date_create: new Date(Date.now()).toISOString()
            })
            await newItem.save();
            return true;
        } catch (err) {
            // this.logger.error(err.response || err.toString());
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
    // async newFeedback(idCustomer, idFeedBack) {
    //     try {
    //         const temp = {
    //             en: "User create feedback successfully",
    //             vi: "Khách hàng đã tạo feedback thành công"
    //         }
    //         const temp2 = `${idCustomer} đã tạo thành công ${idFeedBack}`
    //         const newItem = new this.historyActivityModel({
    //             id_customer: idCustomer.toString(),
    //             id_feedback: idFeedBack,
    //             title: temp,
    //             title_admin: temp2,
    //             body: temp,
    //             type: "customer_create_new_feedback",
    //             date_create: new Date(Date.now()).toISOString()
    //         })
    //         await newItem.save();
    //         console.log("check newFeedBack success", newItem)
    //         return true;
    //     } catch (err) {
    //         // this.logger.error(err.response || err.toString());
    //        throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }
    async customerCreateReview(idOrder: string, idGroupOrder) {
        try {
            const getOrder = await this.orderModel.findById(idOrder);
            const temp = {
                en: "User create review collaborator",
                vi: "Khách hàng đánh giá thành công cộng tác viên"
            };
            const temp2 = `${getOrder.id_customer} đã đánh giá CTV ${getOrder.id_collaborator} qua đơn hàng ${getOrder._id}`;
            const newItem = new this.historyActivityModel({
                id_customer: getOrder.id_customer.toString(),
                id_collaborator: getOrder.id_collaborator.toString(),
                id_order: getOrder._id.toString(),
                id_group_order: idGroupOrder,
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "customer_review_collaborator",
                date_create: new Date(Date.now()).toISOString()
            })
            await newItem.save();
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }



    async customerSuccessTopUp(user, money, transaction: TransactionDocument) {
        try {
            const findCustomer = await this.customerRepositoryService.findOneById(transaction.id_customer.toString());
            const formatMoney = await this.generalHandleService.formatMoney(money)
            const temp = {
                en: "Payment success",
                vi: "Nạp tiền thành công"
            };
            const temp2 = `${user._id} đã nạp ${formatMoney} thành công vào ví Gpay theo phương thức ${transaction.payment_in}`;
            const newItem = this.historyActivityRepositoryService.create({
                id_customer: user._id,
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "customer_success_top_up_pay_point",
                date_create: new Date(Date.now()).toISOString(),
                value: money,
                id_transaction: transaction._id,
                current_pay_point: findCustomer.pay_point,
                status_current_pay_point: 'up'
            })
            const description = {
                en: `Successfully deposit ${formatMoney} account`,
                vi: `Quý khách đã nạp thành công số tiền ${formatMoney} bằng phương thức ${transaction.payment_in.toUpperCase()}.\n Cảm ơn quý khách đã sử dụng dịch vụ của GUVI.`
            };

            const payloadNotification = {
                title: temp,
                description: description,
                type_notification: 'system',
                user_object: 'customer',
                related_id: null,
                id_customer: user._id.toString(),
                id_transistion_customer: transaction._id
            }
            await this.notificationSystemService.newActivity(payloadNotification);

            const arrDeviceToken = await this.deviceTokenModel.find({ user_id: user._id })
            if (arrDeviceToken.length > 0) {
                const payload = {
                    title: "Nạp tiền thành công",
                    body: description.vi,
                    data: { link: "guviapp://" },
                    token: [arrDeviceToken[0].token]
                }
                for (let i = 1; i < arrDeviceToken.length; i++) {
                    payload.token.push(arrDeviceToken[i].token)
                }
                this.notificationService.send(payload)
            }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    /**
     * thông báo giao dịch thất bại
     * @param transition document của transition customer 
     */
    async customerFailTopUp(transition: TransitionCustomerDocument) {
        try {
            const findCustomer = await this.customerRepositoryService.findOneById(transition.id_customer.toString());
            const formatMoney = await this.generalHandleService.formatMoney(transition.money)
            const temp = {
                en: `Payment failed.`,
                vi: `Thanh toán không thành công`
            };
            const title_admin = `${transition.id_customer.toString()} đã nạp ${formatMoney} thất bại vào ví Gpay theo phương thức ${transition.method_transfer}`;
            const newItem = this.historyActivityRepositoryService.create({
                id_customer: transition.id_customer.toString(),
                title: temp,
                title_admin: title_admin,
                body: temp,
                type: "customer_fail_top_up_pay_point",
                date_create: new Date(Date.now()).toISOString(),
                value: transition.money,
                id_transaction: transition._id,
                current_pay_point: findCustomer.pay_point,
                status_current_pay_point: 'none'
            })
            const description = {
                en: `You have failed to make a payment using the ${transition.method_transfer.toUpperCase()} method. Please check and try again !`,
                vi: `Bạn đã thanh toán không thành công từ bằng phương thức ${transition.method_transfer.toUpperCase()}. Vui lòng kiểm tra và thử lại !`
            };
            const payloadNotification = {
                title: temp,
                description: description,
                type_notification: 'system',
                user_object: 'customer',
                related_id: null,
                id_customer: transition.id_customer.toString(),
                id_transistion_customer: transition._id
            }
            await this.notificationSystemService.newActivity(payloadNotification);
            const arrDeviceToken = await this.deviceTokenModel.find({ user_id: transition.id_customer.toString() })
            if (arrDeviceToken.length > 0) {
                const payload = {
                    title: "Thanh toán không thành công",
                    body: description.vi,
                    data: { link: "guviapp://" },
                    token: [arrDeviceToken[0].token]
                }
                for (let i = 1; i < arrDeviceToken.length; i++) {
                    payload.token.push(arrDeviceToken[i].token)
                }
                this.notificationService.send(payload)
            }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async customerSuccessPayment(user, groupOrder, newTrans) {
        try {
            const getCustomer = await this.customerRepositoryService.findOneById(user._id);
            const getService = await this.serviceModel.findById(groupOrder.service._id);
            const formatMoney = await this.generalHandleService.formatMoney(groupOrder.final_fee)
            const temp = {
                en: "Payment success",
                vi: "Thanh toán thành công"
            };
            const temp2 = `${user._id} thanh toán thành công ${formatMoney} cho dịch vụ ${getService.title.vi || ""} theo phưong thức G-Pay`;
            const description = {
                en: `You have successfully paid for the service ${getService.title.vi || ""} with the amount ${formatMoney} for order ${groupOrder.id_view} ! \n Click to check the transaction immediately.`,
                vi: `Bạn đã thanh toán thành công cho dịch vụ ${getService.title.vi || ""} với số tiền ${formatMoney} cho đơn ${groupOrder.id_view} ! \n Nhấn để kiểm tra giao dịch ngay bạn nhé.`
            };
            const newItem = new this.historyActivityModel({
                id_customer: user._id,
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "customer_payment_pay_point_service",
                date_create: new Date(Date.now()).toISOString(),
                value: -groupOrder.final_fee,
                current_pay_point: getCustomer.pay_point,
                status_current_pay_point: "down",
                id_transaction: newTrans._id,
                id_group_order: groupOrder._id
            })
            await newItem.save();

            const payloadNotification = {
                title: temp,
                description: description,
                type_notification: 'system',
                user_object: 'customer',
                related_id: null,
                id_customer: user._id.toString(),
            }
            await this.notificationSystemService.newActivity(payloadNotification);


            const arrDeviceToken = await this.deviceTokenModel.find({ user_id: user._id })
            if (arrDeviceToken.length > 0) {
                const payload = {
                    title: "Thanh toán thành công",
                    body: description.vi,
                    data: { link: "guviapp://" },
                    token: [arrDeviceToken[0].token]
                }
                for (let i = 1; i < arrDeviceToken.length; i++) {
                    payload.token.push(arrDeviceToken[i].token)
                }
                this.notificationService.send(payload)
            }

        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    // async customerSuccessRefundPayPoint(user, order) {
    //     try {
    //         // const getOrder = await this.orderModel.findById(idOrder);
    //         const formatMoney = await this.generalHandleService.formatMoney(money)
    //         const temp = {
    //             en: "Payment success",
    //             vi: "Nạp tiền thành công"
    //         };
    //         const temp2 = `${user._id} đã nạp ${formatMoney} thành công vào ví Gpay theo phương thức ${platform_payment}`;
    //         const newItem = new this.historyActivityModel({
    //             id_customer: user._id,
    //             title: temp,
    //             title_admin: temp2,
    //             body: temp,
    //             type: "customer_success_top_up_pay_point",
    //             date_create: new Date(Date.now()).toISOString(),
    //             value: money
    //         })
    //         await newItem.save();

    //         const description = {
    //             en: `Successfully deposit ${formatMoney} account`,
    //             vi: `Nạp thành công ${formatMoney} vào tài khoản`
    //         };

    //         const payloadNotification = {
    //             title: temp,
    //             description: description,
    //             type_notification: 'system',
    //             user_object: 'customer',
    //             related_id: null,
    //             id_customer: user._id.toString(),
    //         }
    //         await this.notificationSystemService.newActivity(payloadNotification);


    //     const arrDeviceToken = await this.deviceTokenModel.find({ user_id: user._id })
    //     if (arrDeviceToken.length > 0) {
    //         const payload = {
    //             title: "Nạp tiền thành công",
    //             body: description.vi,
    //             data: { link: "guviapp://" },
    //             token: [arrDeviceToken[0].token]
    //         }
    //         for (let i = 1; i < arrDeviceToken.length; i++) {
    //             payload.token.push(arrDeviceToken[i].token)
    //         }
    //         this.notificationService.send(payload)
    //     }

    //     } catch (err) {
    //        throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }

    async customerRequest(user, idService, idRequest) {
        try {
            console.log(user);

            const getService = await this.serviceModel.findById(idService);
            const temp = {
                en: "Requset successfully",
                vi: "Gửi yêu cầu thành công"
            };
            const temp2 = `${user._id} đã gửi yêu cầu tư vấn dịch vụ ${getService.title.vi || ""}`;
            const newItem = new this.historyActivityModel({
                id_customer: user._id,
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "customer_request_service",
                date_create: new Date(Date.now()).toISOString(),
                id_customer_request: idRequest
            })
            await newItem.save();

            const title = {
                vi: "GUVI",
                en: "GUVI"
            }

            const description2 = {
                vi: `Bạn đã gửi yêu cầu dịch vụ Tổng Vệ Sinh. Chúng tôi sẽ liên hệ lại với bạn để hỗ trợ tư vấn.\n Hoặc bạn có thể gọi hotline 1900.0027 khi chưa nhận được tư vấn từ chúng tôi.`,
                en: `You have sent a request for General Cleaning service. We will contact you to provide consulting support.\n Or you can call hotline 1900.0027 if you have not received advice from us.`
            }
            const payloadNotification = {
                title,
                description: description2,
                type_notification: 'activity',
                user_object: 'customer',
                related_id: null,
                id_customer: user._id.toString(),
            }
            await this.notificationSystemService.newActivity(payloadNotification);

            const arrDeviceToken = await this.deviceTokenModel.find({ user_id: user._id })
            if (arrDeviceToken.length > 0) {
                const payload = {
                    title: "GUVI",
                    body: description2.vi,
                    data: { link: "guviapp://" },
                    token: [arrDeviceToken[0].token]
                }
                for (let i = 1; i < arrDeviceToken.length; i++) {
                    payload.token.push(arrDeviceToken[i].token)
                }
                this.notificationService.send(payload)
            }

            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async updateFavoriteCollaborator(lang, idCustomer) {
        try {
            const getCustomer = await this.customerRepositoryService.findOneById(idCustomer);
            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, 'customer')], HttpStatus.NOT_FOUND);
            const query = {
                $and: [
                    { is_delete: false },
                    { id_customer: getCustomer._id },
                    { status: 'pending' }
                ]
            }
            const getOrder = await this.orderModel.find(query);
            const getGroupOrder = await this.groupOrderModel.find(query);
            for (let order of getOrder) {
                order.id_block_collaborator = getCustomer.id_block_collaborator;
                order.id_favourite_collaborator = getCustomer.id_favourite_collaborator;
                await this.orderModel.findOneAndUpdate({_id: order.id}, order);
            }
            for (let groupOrder of getGroupOrder) {
                groupOrder.id_block_collaborator = getCustomer.id_block_collaborator;
                groupOrder.id_favourite_collaborator = getCustomer.id_favourite_collaborator;
                await this.groupOrderModel.findOneAndUpdate({_id: groupOrder.id}, groupOrder);
            }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    // async customerUpdateFavoriteCollaborator(user, idCollaborator) {
    //     try {
    //         const temp = {
    //             en: "Customer change favorite successfully",
    //             vi: "Gửi yêu cầu thành công"
    //         };
    //         const temp2 = `${user._id} đã gửi yêu cầu tư vấn dịch vụ ${getService.title.vi || ""}`;
    //         const description = {
    //             en: `You request service ${getService.title.en || ""}`,
    //             vi: `Bạn đã gửi yêu cầu tư vấn dịch vụ ${getService.title.vi || ""}`
    //         };
    //         const newItem = new this.historyActivityModel({
    //             id_customer: user._id,
    //             title: temp,
    //             title_admin: temp2,
    //             body: temp,
    //             type: "customer_request_service",
    //             date_create: new Date(Date.now()).toISOString(),
    //             id_customer_request: idRequest
    //         })
    //         await newItem.save();

    //         const payloadNotification = {
    //             title: temp,
    //             description: description,
    //             type_notification: 'activity',
    //             user_object: 'customer',
    //             related_id: null,
    //             id_customer: user._id.toString(),
    //         }
    //         await this.notificationSystemService.newActivity(payloadNotification);
    //         return true;
    //     } catch (err) {
    //        throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
    //     }
    // }

    async adminTopUpMoneyForCustomer(transition, customer_id, admin_id) {
        try {
            const findCustomer = await this.customerRepositoryService.findOneById(customer_id);
            const admin = await this.userSystemRepositoryService.findOneById(admin_id);
            // const getOrder = await this.orderModel.findById(idOrder);
            const formatMoney = await this.generalHandleService.formatMoney(transition.money)
            const temp = {
                en: "Payment success",
                vi: "Nạp tiền thành công"
            };
            const temp2 = `${admin.full_name} đã duyệt lệnh nạp ${transition.money} cho KH ${findCustomer.id_view}`;
            const newItem = new this.historyActivityModel({
                id_customer: findCustomer._id,
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "admin_top_up_money_customer",
                date_create: new Date(Date.now()).toISOString(),
                value: transition.money,
                id_transistion_customer: transition._id,
                current_pay_point: findCustomer.pay_point,
                status_current_pay_point: transition.status_pay_point_current

            })
            await newItem.save();

            const description = {
                en: `You have successfully deposited ${formatMoney} from GUVI.\n Thank you for using GUVI's services.`,
                vi: `Quý khách đã nạp thành công ${formatMoney} từ GUVI.\n Cảm ơn quý khách đã sử dụng dịch vụ của GUVI.`
            };

            const payloadNotification = {
                title: temp,
                description: description,
                type_notification: 'system',
                user_object: 'customer',
                related_id: null,
                id_customer: findCustomer._id.toString(),
                id_transistion_customer: transition._id
            }
            await this.notificationSystemService.newActivity(payloadNotification);


            const arrDeviceToken = await this.deviceTokenModel.find({ user_id: findCustomer._id })
            if (arrDeviceToken.length > 0) {
                const payload = {
                    title: "Nạp tiền thành công",
                    body: description.vi,
                    data: { link: "guviapp://" },
                    token: [arrDeviceToken[0].token]
                }
                for (let i = 1; i < arrDeviceToken.length; i++) {
                    payload.token.push(arrDeviceToken[i].token)
                }
                this.notificationService.send(payload)
            }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async adminWithdrawMoneyForCustomer(transition, customer_id, admin_id) {
        try {
            const findCustomer = await this.customerRepositoryService.findOneById(customer_id);
            const admin = await this.userSystemRepositoryService.findOneById(admin_id);
            // const getOrder = await this.orderModel.findById(idOrder);
            const formatMoney = await this.generalHandleService.formatMoney(transition.money)
            const temp = {
                en: "Withdraw money success",
                vi: "Rút tiền thành công"
            };
            const temp2 = `${admin.full_name} đã duyệt lệnh rút ${transition.money} cho KH ${findCustomer.id_view}`;
            const newItem = new this.historyActivityModel({
                id_customer: findCustomer._id,
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "admin_withdraw_money_customer",
                date_create: new Date(Date.now()).toISOString(),
                value: transition.money,
                id_transistion_customer: transition._id,
                current_pay_point: findCustomer.pay_point,
                status_current_pay_point: transition.status_pay_point_current

            })
            await newItem.save();

            const description = {
                en: `GUVI has helped you successfully withdraw ${formatMoney} from Gpay wallet.\n Click to check the transaction now.`,
                vi: `GUVI đã hỗ trợ bạn rút thành công số tiền ${formatMoney} từ ví Gpay.\n Nhấn để kiểm tra giao dịch ngay bạn nhé.`
            };

            const payloadNotification = {
                title: temp,
                description: description,
                type_notification: 'system',
                user_object: 'customer',
                related_id: null,
                id_customer: findCustomer._id.toString(),
                id_transistion_customer: transition._id
            }
            await this.notificationSystemService.newActivity(payloadNotification);


            const arrDeviceToken = await this.deviceTokenModel.find({ user_id: findCustomer._id })
            if (arrDeviceToken.length > 0) {
                const payload = {
                    title: "Rút tiền thành công",
                    body: description.vi,
                    data: { link: "guviapp://" },
                    token: [arrDeviceToken[0].token]
                }
                for (let i = 1; i < arrDeviceToken.length; i++) {
                    payload.token.push(arrDeviceToken[i].token)
                }
                this.notificationService.send(payload)
            }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async inviterCodeWasApplied(customerName, codeInviter) {
        try {
            const customerCodeInviter = await this.customerModel.findOne({ invite_code: codeInviter });
            const temp = {
                vi: "GUVI",
                en: "GUVI"
            }

            const temp2 = `${customerName} đã nhập mã giới thiệu của ${customerCodeInviter.full_name}`

            const newItem = new this.historyActivityModel({
                id_customer: customerCodeInviter._id,
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "customer_inviter_code_was_applied",
                date_create: new Date(Date.now()).toISOString(),
                current_pay_point: customerCodeInviter.pay_point
            })
            await newItem.save();

            const title = {
                vi: "GUVI",
                en: "GUVI"
            }

            const description = {
                vi: `Người bạn "${customerName}" đã nhập mã giới thiệu của bạn. Chỉ một bước đặt đơn nữa thôi bạn sẽ nhận được phần thưởng từ GUVI.\n Cùng tải app, cùng chung vui !!! Nhấn đây để xem chi tiết.`,
                en: `Your friend "${customerName}" has entered your referral code. Just one more step to place an order and you will receive a reward from GUVI.\n Download the app and have fun together!!! Click here to see details.`
            }

            const payloadCustomerNoti = {
                title,
                description,
                type_notification: 'activity',
                user_object: 'customer',
                related_id: null,
                id_customer: customerCodeInviter._id.toString(),
            }
            await this.notificationSystemService.newActivity(payloadCustomerNoti);

            const arrDeviceToken = await this.deviceTokenModel.find({ user_id: customerCodeInviter._id })
            if (arrDeviceToken.length > 0) {
                const payload = {
                    title: "GUVI",
                    body: description.vi,
                    data: { link: "guviapp://" },
                    token: [arrDeviceToken[0].token]
                }
                for (let i = 1; i < arrDeviceToken.length; i++) {
                    payload.token.push(arrDeviceToken[i].token)
                }
                this.notificationService.send(payload)
            }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }

    }
    async customerCreateTransaction(transaction: TransactionDocument) {
        try {
            const temp = {
                en: "Customer create transaction successfully",
                vi: "Khách hàng đã tạo lệnh giao dịch thành công"
            }
            const temp2 = `${transaction.id_customer} đã tạo lệnh giao dịch thành công`
            const payload = {
                id_customer: transaction.id_customer,
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "customer_create_transaction",
                date_create: new Date(Date.now()).toISOString(),
                id_transaction: transaction._id
            }
            const result = await this.historyActivityRepositoryService.create(payload);
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async customerPunishedTicket(ticket, customer, money) {
        try {
            const temp = {
                vi: `${customer.full_name} đã bị phạt ${money} vì ${ticket.title.vi}`,
                en: `${customer.full_name} was fined ${money} for ${ticket.title.vi}`
            }

            const temp2 = `${customer.full_name} đã bị phạt ${money} vì ${ticket.title.vi}`;

            const newItem = new this.historyActivityModel({
                id_customer: customer._id,
                id_punish_ticket: ticket._id,
                id_order: ticket.id_order,
                id_admin_action: ticket.id_admin_action,
                id_transaction: ticket.id_transaction,
                value: money,
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "customer_punished_ticket",
                date_create: new Date(Date.now()).toISOString(),
                current_pay_point: customer.pay_point
            })
            await newItem.save();

            const title = {
                vi: "GUVI",
                en: "GUVI"
            }

            const description = {
                vi: `${customer.full_name} đã bị phạt ${money} vì ${ticket.title.vi}`,
                en: `${customer.full_name} was fined ${money} for ${ticket.title.vi}`
            }

            const payloadCustomerNoti = {
                title,
                description,
                type_notification: 'system',
                user_object: 'customer',
                related_id: null,
                id_customer: customer._id.toString(),
            }
            await this.notificationSystemService.newActivity(payloadCustomerNoti);

            const arrDeviceToken = await this.deviceTokenModel.find({ user_id: customer._id })
            if (arrDeviceToken.length > 0) {
                const payload = {
                    title: "GUVI",
                    body: description.vi,
                    data: { link: "guviapp://" },
                    token: [arrDeviceToken[0].token]
                }
                for (let i = 1; i < arrDeviceToken.length; i++) {
                    payload.token.push(arrDeviceToken[i].token)
                }
                this.notificationService.send(payload)
            }

        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
