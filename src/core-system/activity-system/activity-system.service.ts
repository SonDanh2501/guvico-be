import { Body, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Collaborator, Customer, CustomerDocument, DeviceToken, DeviceTokenDocument, ERROR, Order, OrderDocument, Promotion, PromotionDocument, Service, ServiceDocument, TransitionCollaborator, TransitionCollaboratorDocument, UserSystem, UserSystemDocument, previousBalanceCollaboratorDTO } from 'src/@core';
import { GroupOrder, GroupOrderDocument } from 'src/@core/db/schema/group_order.schema';
import { HistoryActivity, HistoryActivityDocument } from 'src/@core/db/schema/history_activity.schema';
import { HistoryOrder, HistoryOrderDocument } from 'src/@core/db/schema/history_order.schema';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationSystemService } from '../notification-system/notification-system.service';
import { ActivityAdminSystemService } from '../activity-admin-system/activity-admin-system.service';
import { CustomerSetting, CustomerSettingDocument } from '../../@core/db/schema/customer_setting.schema';
import { TransitionCustomer, TransitionCustomerDocument } from '../../@core/db/schema/transition_customer.schema';
import { GeneralHandleService } from '../../@share-module/general-handle/general-handle.service';
import { TransactionDocument } from 'src/@repositories/module/mongodb/@database/schema/transaction.schema';
import { CollaboratorDocument, PunishTicketDocument } from 'src/@repositories/module/mongodb/@database';
import { CollaboratorRepositoryService } from 'src/@repositories/repository-service/collaborator-repository/collaborator-repository.service';
import { HistoryActivityRepositoryService } from 'src/@repositories/repository-service/history-activity-repository/history-activity-repository.service';
import { HistoryActivitySystemService } from '../history-activity-system/history-activity-system.service';
import { title } from 'process';
import { createHistoryActivityDTO } from 'src/@core/dto/historyActivity.dto';
import { CustomerRepositoryService } from 'src/@repositories/repository-service/customer-repository/customer-repository.service';
import { PunishTicketRepositoryService } from 'src/@repositories/repository-service/punish-ticket-repository/punish-ticket-repository.service';
import { PushNotiSystemService } from '../push-noti-system/push-noti-system.service';
import { createTransactionDTO } from 'src/@core/dto/transaction.dto';
import { TransactionRepositoryService } from 'src/@repositories/repository-service/transaction-repository/transaction-repository.service';
import { OrderRepositoryService } from 'src/@repositories/repository-service/order-repository/order-repository.service';
import { GroupOrderRepositoryService } from 'src/@repositories/repository-service/group-order-repository/group-order-repository.service';
import { ReasonsCancelRepositoryService } from 'src/@repositories/repository-service/reasons-cancel-repository/reasons-cancel-repository.service';
import { UserSystemRepositoryService } from 'src/@repositories/repository-service/user-system-repository/user-system-repository.service';

@Injectable()
export class ActivitySystemService {
    constructor(
        private customExceptionService: CustomExceptionService,
        private notificationService: NotificationService,
        private notificationSystemService: NotificationSystemService,
        private generalHandleService: GeneralHandleService,
        private collaboratorRepositoryService: CollaboratorRepositoryService,
        private historyActivityRepositoryService: HistoryActivityRepositoryService,
        private historyActivitySystemService: HistoryActivitySystemService,
        private punishTicketRepositoryService: PunishTicketRepositoryService,
        private customerRepositoryService: CustomerRepositoryService,
        private transactionRepositoryService: TransactionRepositoryService,
        private pushNotiSystemService: PushNotiSystemService,
        private orderRepositoryService: OrderRepositoryService,
        private groupOrderRepositoryService: GroupOrderRepositoryService,
        private reasonsCancelRepositoryService: ReasonsCancelRepositoryService,
        private userSystemRepositoryService: UserSystemRepositoryService,



        // @InjectModel(HistoryOrder.name) private historyOrderModel: Model<HistoryOrderDocument>,
        @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
        @InjectModel(UserSystem.name) private userSystemModel: Model<UserSystemDocument>,
        @InjectModel(Collaborator.name) private collaboratorModel: Model<CollaboratorDocument>,
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @InjectModel(GroupOrder.name) private groupOrderModel: Model<GroupOrderDocument>,
        @InjectModel(DeviceToken.name) private deviceTokenModel: Model<DeviceTokenDocument>,
        @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
        @InjectModel(HistoryActivity.name) private historyActivityModel: Model<HistoryActivityDocument>,
        @InjectModel(TransitionCustomer.name) private transitionCustomerModel: Model<TransitionCustomerDocument>,
        @InjectModel(TransitionCollaborator.name) private transitionCollaboratorModel: Model<TransitionCollaboratorDocument>,
        @InjectModel(Promotion.name) private promotionModel: Model<PromotionDocument>,

    ) { }

    async cancelOrderBySystem(idCustomer, idOrder) {
        try {
            const getCustomer = await this.customerRepositoryService.findOneById(idCustomer);
            const getOrder = await this.orderModel.findById(idOrder);
            const temp = {
                en: "Order canceled due to overtime",
                vi: "Đơn hàng bị huỷ do quá thời gian nhận"
            }

            let temp2 = `${getCustomer._id} có đơn hàng ${idOrder} đã bị huỷ do quá thời gian nhận việc`;
            const newItem = new this.historyActivityModel({
                id_customer: idCustomer.toString(),
                title: temp,
                body: temp,
                title_admin: temp2,
                type: 'system_cancel_order',
                id_order: idOrder,
                date_create: new Date(Date.now()).toISOString()
            })
            const arrDeviceToken = await this.deviceTokenModel.find({ user_id: idCustomer })

            const title = {
                vi: "GUVI",
                en: "GUVI"
            };
            const description = {
                vi: `Hiện tại, tất cả "Cộng tác viên" đều đang bận hoặc chưa thể nhận ca làm của bạn. Hãy thử đặt lại vào một khung giờ khác thử xem nhé!\nĐơn ${getOrder.id_view} đã được hủy tự động, bạn không cần phải làm gì cả.`,
                en: `Currently, all "Collaborators" are busy or cannot accept your shift. Please try again at another time!\nOrder ${getOrder.id_view} has been canceled automatically, you do not need to do anything.`
            }
            const payloadNotiCustomer = {
                title,
                description,
                user_object: "customer",
                id_customer: getCustomer._id,
                type_notification: "activity",
                related_id: idOrder,
                id_group_order: getOrder.id_group_order,
                id_order: idOrder
            }
            this.notificationSystemService.newActivity(payloadNotiCustomer)
            // console.log(arrDeviceToken, 'findDeviceToken')
            if (arrDeviceToken.length > 0) {
                const payload = {
                    title: "GUVI",
                    body: `Hiện tại, tất cả "Cộng tác viên" đều đang bận hoặc chưa thể nhận ca làm của bạn. Hãy thử đặt lại vào một khung giờ khác thử xem nhé!\nĐơn ${getOrder.id_view} đã được hủy tự động, bạn không cần phải làm gì cả.`,
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
            // this.logger.error(err.response || err.toString());
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async systemCreatePromotion(idPromotion) {
        try {
            const getPromotion = await this.promotionModel.findById(idPromotion);
            const temp = {
                en: "Promotion create promotion by system",
                vi: "Khuyến mãi được tạo ra bởi hệ thống"
            }

            let temp2 = `${getPromotion._id} đã được tạo ra bởi hệ thống`;
            const newItem = new this.historyActivityModel({
                id_promotion: getPromotion._id.toString(),
                title: temp,
                body: temp,
                title_admin: temp2,
                type: 'system_create_promotion',
                date_create: new Date(Date.now()).toISOString()
            })

            await newItem.save();
            return true;
        } catch (err) {
            // this.logger.error(err.response || err.toString());
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async cancelOrderConfirmBySystem(idCustomer, idCollaborator, idOrder) {
        try {
            const getCustomer = await this.customerRepositoryService.findOneById(idCustomer);
            const getOrder = await this.orderModel.findById(idOrder);
            const temp = {
                en: "Order was canceled because the collaborator did not accept the job",
                vi: "Đơn hàng bị huỷ do CTV không bắt đầu công việc"
            }

            let temp2 = `${getCustomer._id} có đơn hàng ${idOrder} đã bị huỷ do CTV ${idCollaborator} không bắt đầu công việc`;
            const newItem = new this.historyActivityModel({
                id_customer: idCustomer.toString(),
                id_collaborator: idCollaborator.toString(),
                title: temp,
                body: temp,
                title_admin: temp2,
                type: 'system_cancel_order_confirm',
                id_order: idOrder,
                date_create: new Date(Date.now()).toISOString()
            })
            const arrDeviceToken = await this.deviceTokenModel.find({ user_id: idCustomer })
            // console.log(arrDeviceToken, 'findDeviceToken')
            if (arrDeviceToken.length > 0) {
                const payload = {
                    title: "Công việc đã bị huỷ",
                    body: "Công việc bị huỷ do CTV không bắt đầu công việc.",
                    token: [arrDeviceToken[0].token]
                }
                for (let i = 1; i < arrDeviceToken.length; i++) {
                    payload.token.push(arrDeviceToken[i].token)
                }
                this.notificationService.send(payload)
            }

            const arrDeviceTokenCollaborator = await this.deviceTokenModel.find({ user_id: idCollaborator })
            // console.log(arrDeviceTokenCollaborator, 'findDeviceToken')
            if (arrDeviceTokenCollaborator.length > 0) {
                const payload = {
                    title: "Công việc đã bị huỷ",
                    body: "Bạn có 1 công việc bị huỷ do không bắt đầu công việc",
                    token: [arrDeviceTokenCollaborator[0].token]
                }
                for (let i = 1; i < arrDeviceTokenCollaborator.length; i++) {
                    payload.token.push(arrDeviceTokenCollaborator[i].token)
                }
                this.notificationService.send(payload)
            }

            await newItem.save();
            return true;
        } catch (err) {
            // this.logger.error(err.response || err.toString());
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async systemGiveMoney(idCollaborator, idInviter, money: number) {
        try {
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(idCollaborator);
            const getInviter = await this.collaboratorRepositoryService.findOneById(idInviter);
            const temp = {
                en: `You are given ${money}đ`,
                vi: `Bạn được tặng ${money}đ`
            }
            const title = {
                en: `${getCollaborator.full_name} done 3 jobs with good review`,
                vi: `${getCollaborator.full_name} đã hoàn thành 3 ca làm được đánh giá tốt`
            }
            const titleHistory = {
                en: `You given ${money}đ because  ${getCollaborator.full_name} done 3 jobs with good review`,
                vi: `Bạn được tặng ${money}đ vì ${getCollaborator.full_name} đã hoàn thành 3 ca làm được đánh giá tốt`
            }
            let temp2 = `${getInviter._id} được tặng ${money}đ vì đã giới thiệu CTV ${getCollaborator.full_name}`;
            const newItem = new this.historyActivityModel({
                id_collaborator: idInviter.toString(),
                title: titleHistory,
                body: title,
                title_admin: temp2,
                type: 'system_given_money',
                date_create: new Date(Date.now()).toISOString(),
                value: money,
            })
            const payloadNotification = {
                title: temp,
                description: title,
                type_notification: 'activity',
                user_object: 'collaborator',
                related_id: null,
                id_collaborator: idInviter.toString(),
            }
            await this.notificationSystemService.newActivity(payloadNotification);
            const arrDeviceToken = await this.deviceTokenModel.find({ user_id: idInviter })
            if (arrDeviceToken.length > 0) {
                const payload = {
                    title: `Bạn được tặng ${money}`,
                    body: `Bạn được tặng ${money} vì đã giới thiệu CTV mới`,
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
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async systemGiveMoneyPaymentDiscount(idCustomer, idTransition, money: number) {
        try {
            const money_string = await this.generalHandleService.formatMoney(money);
            const temp = {
                en: `You are given ${money_string}đ from payment discount Point`,
                vi: `Bạn được tặng ${money_string}đ  từ chương trình chiết khấu sau khi nạp Point`
            }
            let temp2 = `${idCustomer} được tặng ${money_string}đ  từ chương trình chiết khấu sau khi nạp Point`;
            const newItem = new this.historyActivityModel({
                id_transistion_customer: idTransition.toString(),
                id_customer: idCustomer,
                title: temp,
                body: temp,
                title_admin: temp2,
                type: 'system_given_money',
                date_create: new Date(Date.now()).toISOString(),
                value: money,
                value_string: money_string
            });
            const payloadNotification = {
                title: temp,
                description: temp,
                type_notification: 'system',
                user_object: 'customer',
                related_id: null,
                id_customer: idCustomer.toString(),
            }
            await this.notificationSystemService.newActivity(payloadNotification);
            const arrDeviceToken = await this.deviceTokenModel.find({ user_id: idCustomer })
            if (arrDeviceToken.length > 0) {
                const payload = {
                    title: `Bạn được tặng ${money_string} từ chương trình chiết khấu sau khi nạp Point`,
                    body: `Bạn được tặng ${money_string} từ chương trình chiết khấu sau khi nạp Point`,
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
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async adminCheckReview(idOrder: string) {
        try {
            const message = {
                en: 'System check review order',
                vi: 'Hệ thống đã tự động kiểm tra đánh giá',
            }
            const temp = `Hệ thống đã tự động kiểm tra đánh giá đơn hàng ${idOrder} thành công`;
            const newItem = new this.historyActivityModel({
                id_order: idOrder,
                title: message,
                body: message,
                title_admin: temp,
                type: 'system_auto_check_review',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }


    async systemUnlockCollaborator(collaborator: CollaboratorDocument) {
        try {
            const message = {
                en: 'Your account has been unlocked due to sufficient time',
                vi: 'Tài khoản của bạn đã được mở khoá do đủ thời gian',
            }
            const temp = `Hệ thống tự động mở khoá tài khoản do đủ thời gian`;
            const newItem = new this.historyActivityModel({
                id_collaborator: collaborator._id,
                title: message,
                body: message,
                title_admin: temp,
                type: 'system_auto_unlock_collaborator',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }
    ////

    /**
     * 
     * @param transition thông tin chuyển khoản của CTV
     * @param collaborator  thông tin của CTV
     * @param previousBalance số dư trước và sao khi được phê duyệt lệnh chuyển khoản
     * @returns 
     */
    // async verifyTopupCollaborator(transaction: TransactionDocument, collaborator: CollaboratorDocument, previousBalance?: previousBalanceCollaboratorDTO) {
    //     try {
    //         const temp = {
    //             en: "Top up successfully",
    //             vi: "Nạp tiền thành công"
    //         }
    //         const formatMoney = await this.generalHandleService.formatMoney(transaction.money);
    //         const titleAdmin = `CTV ${collaborator._id} đã nạp thành công ${formatMoney} bằng phương thức thanh toán ${transaction.payment_in}`
    //         const payload = {
    //             id_collaborator: collaborator._id,
    //             title: temp,
    //             title_admin: titleAdmin,
    //             body: temp,
    //             type: "verify_top_up",
    //             date_create: new Date(Date.now()).toISOString(),
    //             value: transaction.money,
    //             id_transaction: transaction._id,
    //             current_work_wallet: collaborator.work_wallet,
    //             status_current_work_wallet: "up",
    //             current_collaborator_wallet: collaborator.collaborator_wallet,
    //             status_current_collaborator_wallet: "none"
    //         }
    //         // const newItem = new this.historyActivityModel({
    //         //     id_collaborator: collaborator._id,
    //         //     title: temp,
    //         //     title_admin: titleAdmin,
    //         //     body: temp,
    //         //     type: "verify_top_up",
    //         //     date_create: new Date(Date.now()).toISOString(),
    //         //     value: transaction.money,
    //         //     id_transaction: transaction._id,
    //         //     current_work_wallet: collaborator.work_wallet,
    //         //     status_current_work_wallet: "up",
    //         //     current_collaborator_wallet: collaborator.collaborator_wallet,
    //         //     status_current_collaborator_wallet: "none"
    //         // })
    //         // await newItem.save();
    //         await this.historyActivityRepositoryService.create(payload);
    //         const description = {
    //             vi: `Lệnh nạp tiền ${transaction.transfer_note} đã được phê duyệt thành công`,
    //             en: `The tranfer ${transaction.transfer_note} is verify successful`,
    //         }
    //         const payloadNotification = {
    //             title: temp,
    //             description: description,
    //             user_object: "collaborator",
    //             id_collaborator: collaborator._id,
    //             type_notification: "activity",
    //             id_transistion_collaborator: transaction._id
    //         }
    //         this.notificationSystemService.newActivity(payloadNotification);
    //         const arrDeviceToken = await this.deviceTokenModel.find({ user_id: collaborator._id })
    //         if (arrDeviceToken.length > 0) {
    //             const playload = {
    //                 title: "Nạp tiền thành công",
    //                 body: `Bạn đã nạp ${formatMoney} vào tài khoản của mình`,
    //                 token: [arrDeviceToken[0].token],
    //                 data: { link: "guvipartner://Wallet" }
    //             }
    //             for (let i = 1; i < arrDeviceToken.length; i++) {
    //                 playload.token.push(arrDeviceToken[i].token)
    //             }
    //             this.notificationService.send(playload)
    //         }
    //         return true;
    //     } catch (err) {
    //         throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
    //     }

    // }
    /**
     * 
     * @param transition thông tin chuyển khoản của CTV
     * @param collaborator  thông tin của CTV
     * @returns 
     */
    async cancelTransCollaborator(transition: TransitionCollaboratorDocument) {
        try {
            const message = {
                en: 'Cancel transfer of collaborator',
                vi: 'Đã hủy lệnh rút/nạp của cộng tác viên',
            }
            const temp = `Lệnh rút/nạp ${transition._id} của cộng tác viên ${transition.id_collaborator} đã bị huỷ`;
            const payload = {
                id_collaborator: transition.id_collaborator,
                id_transaction: transition._id,
                title: message,
                body: message,
                title_admin: temp,
                type: 'cancel_transfer_collaborator',
                date_create: new Date(Date.now()).toISOString(),
            }
            await this.historyActivityRepositoryService.create(payload)
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    // async holdingMoneyCollaborator(collaborator: CollaboratorDocument, transfer: TransactionDocument, previousBalance: previousBalanceCollaboratorDTO) {
    //     try {
    //         const message = {
    //             en: 'Holding money of collaborator',
    //             vi: 'Tiến hành tạm giữ tiền của cộng tác viên',
    //         }
    //         const getCollaborator = await this.collaboratorRepositoryService.findOneById(collaborator._id)
    //         const temp = `Hệ thống tiến hành quá trình tạm giữ tiền từ lệnh giao dịch ${transfer._id}`;
    //         const payload = {
    //             id_transaction: transfer._id,
    //             title: message,
    //             body: message,
    //             title_admin: temp,
    //             type: 'system_holding_money_user',
    //             date_create: new Date(Date.now()).toISOString(),
    //             value: transfer.money,
    //             current_collaborator_wallet: getCollaborator.collaborator_wallet,
    //             status_current_collaborator_wallet: (previousBalance.collaborator_wallet < getCollaborator.collaborator_wallet) ?
    //                 "up" : (previousBalance.collaborator_wallet > getCollaborator.collaborator_wallet) ? "down" : "none",
    //             current_work_wallet: getCollaborator.work_wallet,
    //             status_current_work_wallet: (previousBalance.work_wallet < getCollaborator.work_wallet) ?
    //                 "up" : (previousBalance.work_wallet > getCollaborator.work_wallet) ? "down" : "none",
    //         }
    //         await this.historyActivityRepositoryService.create(payload)

    //         // const newItem = new this.historyActivityModel({
    //         //     id_transaction: transfer._id,
    //         //     title: message,
    //         //     body: message,
    //         //     title_admin: temp,
    //         //     type: 'system_holding_money_user',
    //         //     date_create: new Date(Date.now()).toISOString(),
    //         //     value: transfer.money,
    //         //     current_collaborator_wallet: getCollaborator.collaborator_wallet,
    //         //     status_current_collaborator_wallet: (previousBalance.collaborator_wallet < getCollaborator.collaborator_wallet) ?
    //         //         "up" : (previousBalance.collaborator_wallet > getCollaborator.collaborator_wallet) ? "down" : "none",
    //         //     current_work_wallet: getCollaborator.work_wallet,
    //         //     status_current_work_wallet: (previousBalance.work_wallet < getCollaborator.work_wallet) ?
    //         //         "up" : (previousBalance.work_wallet > getCollaborator.work_wallet) ? "down" : "none",
    //         // })
    //         // await newItem.save();
    //         return true;
    //     } catch (err) {
    //         throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
    //     }
    // }

    async giveBackMoneyCollaborator(collaborator: CollaboratorDocument, transaction: TransactionDocument, previousBalance: previousBalanceCollaboratorDTO) {
        try {
            const formatMoney = await this.generalHandleService.formatMoney(transaction.money)
            const title = {
                vi: `Hệ thống hoàn tiền cho bạn`,
                en: `The system temporarily holds your money`
            }
            const description = {
                vi: `Hệ thống hoàn ${formatMoney} cho bạn từ lệnh rút tiền ${transaction.id_view}`,
                en: `The system give back ${formatMoney} your money from transaction withdraw ${transaction.id_view}`
            }
            const temp = `Hệ thống hoàn ${formatMoney} tiền tạm giữ tiền từ lệnh giao dịch ${transaction.id_view}`;
            await this.historyActivitySystemService.createItem({
                id_transaction: transaction._id,
                id_collaborator: collaborator._id,
                title: title,
                body: description,
                title_admin: temp,
                type: 'give_back_money_collaborator',
                date_create: new Date(Date.now()).toISOString(),
                value: transaction.money,
                current_collaborator_wallet: collaborator.collaborator_wallet,
                status_current_collaborator_wallet: (previousBalance.collaborator_wallet < collaborator.collaborator_wallet) ?
                    "up" : (previousBalance.collaborator_wallet > collaborator.collaborator_wallet) ? "down" : "none",
                current_work_wallet: collaborator.work_wallet,
                status_current_work_wallet: (previousBalance.work_wallet < collaborator.work_wallet) ?
                    "up" : (previousBalance.work_wallet > collaborator.work_wallet) ? "down" : "none",
            });
            this.pushNotiSystemService.pushNotiGiveBackMoneyCollaborator(transaction);
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async standbyToWaitingPunishTicket(ticket: PunishTicketDocument, admin?: UserSystemDocument) {
        try {
            const message = {
                en: `Punish ticket was changed status "Waiting"`,
                vi: `Vé phạt đã được chuyển sang trạng thái "Chờ xử lý"`,
            }
            const title_admin = `Vé phạt ${ticket.id_view} đã được chuyển sang trạng thái "Chờ xử lý"`;
            this.historyActivityRepositoryService.create({
                title: message,
                body: message,
                title_admin: title_admin,
                type: 'punish_ticket_standby_to_waiting',
                date_create: new Date(Date.now()).toISOString(),
                id_punish_ticket: ticket._id,
                id_admin_action: admin._id
            })
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async waitingToDoingPunishTicket(ticket: PunishTicketDocument, admin?: UserSystemDocument) {
        try {
            const message = {
                en: `Punish ticket was changed status "Doing"`,
                vi: `Vé phạt đã được chuyển sang trạng thái "Đang thực thi"`,
            }
            const title_admin = `Vé phạt ${ticket.id_view} đã được chuyển sang trạng thái "Đang thực thi"`;
            this.historyActivityRepositoryService.create({
                title: message,
                body: message,
                title_admin: title_admin,
                type: 'punish_ticket_waiting_to_doing',
                date_create: new Date(Date.now()).toISOString(),
                id_punish_ticket: ticket._id,
                id_admin_action: admin._id,
            })
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async doingToDonePunishTicket(ticket, admin?) {
        try {
            const message = {
                en: `Punish ticket was changed status is "done"`,
                vi: `Vé phạt được chuyển sang trạng thái là "Hoàn thành"`,
            }
            const title_admin = `Vé phạt ${ticket.id_view} đã được chuyển sang trạng thái "Hoàn thành"`;
            this.historyActivityRepositoryService.create({
                id_punish_ticket: ticket._id,
                id_transaction: ticket.id_transaction,
                id_collaborator: ticket.id_collaborator,
                id_customer: ticket.id_customer,
                id_order: ticket.id_order,
                id_admin_action: admin._id,
                title: message,
                body: message,
                title_admin: title_admin,
                type: 'punish_ticket_doing_to_done',
                date_create: new Date(Date.now()).toISOString(),
            })
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async punishCollaborator(punishTicket: PunishTicketDocument) {
        try {
            const message = {
                en: 'Create punish transaction collaborator',
                vi: 'Đã tạo lệnh phạt tiền cho cộng tác viên',
            }
            const temp = `CTV ${punishTicket.id_collaborator} đã bị phạt từ vé phạt ${punishTicket.id_view}`;
            const payloadHistory = {
                id_collaborator: punishTicket.id_collaborator,
                id_punish_ticket: punishTicket._id,
                id_transaction: punishTicket.id_transaction,
                title: message,
                body: message,
                title_admin: temp,
                value: punishTicket.punish_money,
                type: 'create_punish_transaction'
            }
            await this.historyActivitySystemService.createItem(payloadHistory);
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async verifyPunishCollaboratorTransaction(transaction, previousBalance) {
        try {
            const getPunishTicket = await this.punishTicketRepositoryService.findOneById(transaction.id_punish_ticket);
            if (!getPunishTicket) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, 'vi', 'id_punish_ticket')], HttpStatus.NOT_FOUND);
            const collaborator = await this.collaboratorRepositoryService.findOneById(getPunishTicket.id_collaborator);
            const order = await this.orderRepositoryService.findOneById(getPunishTicket.id_order);

            const temp = {
                en: `Punish collaborator because ${getPunishTicket.note_admin || getPunishTicket.title.en}${order !== null ? ` shift ${order.id_view}` : ""}`,
                vi: `Phạt CTV vì lý do ${getPunishTicket.note_admin || getPunishTicket.title.vi}${order !== null ? ` ca làm việc ${order.id_view}` : ""}`
            }
            const temp2 = `Phạt CTV vì lý do ${getPunishTicket.note_admin || getPunishTicket.title.vi}${order !== null ? ` ca làm việc ${order.id_view}` : ""}`
            await this.historyActivityRepositoryService.create({
                id_collaborator: getPunishTicket.id_collaborator,
                id_punish_ticket: getPunishTicket._id,
                id_admin_action: getPunishTicket.id_admin_action,
                id_admin_verify: getPunishTicket.id_admin_verify,
                id_order: getPunishTicket.id_order,
                id_transaction: getPunishTicket.id_transaction,
                title: temp,
                title_admin: temp2,
                body: temp,
                type: `verify_transaction_punish_ticket`,
                date_create: new Date(Date.now()).toISOString(),
                value: -transaction.money,
                current_work_wallet: collaborator.work_wallet,
                status_current_work_wallet: (previousBalance.work_wallet < collaborator.work_wallet) ?
                    "up" : (previousBalance.work_wallet > collaborator.work_wallet) ? "down" : "none",
                current_collaborator_wallet: collaborator.collaborator_wallet,
                status_current_collaborator_wallet: (previousBalance.collaborator_wallet < collaborator.collaborator_wallet) ?
                    "up" : (previousBalance.collaborator_wallet > collaborator.collaborator_wallet) ? "down" : "none",
            })

            const arrDeviceToken = await this.deviceTokenModel.find({ user_id: collaborator._id })
            const formatMoney = await this.generalHandleService.formatMoney(getPunishTicket.punish_money);
            const description = {
                en: `You are punish ${formatMoney} because ${getPunishTicket.title.en}${order !== null ? ` shift ${order.id_view}` : ""}`,
                vi: `Bạn đã bị phạt ${formatMoney} vì lý do ${getPunishTicket.title.vi}${order !== null ? ` ca làm việc ${order.id_view}` : ""}`
            }
            const payloadNotification = {
                title: temp,
                description: description,
                user_object: "collaborator",
                id_collaborator: collaborator._id,
                type_notification: "system",
                id_group_order: getPunishTicket.id_group_order,
                id_order: getPunishTicket.id_order,
            }
            await this.notificationSystemService.newActivity(payloadNotification);
            if (arrDeviceToken.length > 0) {
                const playload = {
                    title: "Bạn đã bị phạt tiền",
                    body: `Bạn đã bị phạt ${formatMoney} vì lý do ${getPunishTicket.note_admin}${order !== null ? ` ca làm việc ${order.id_view}` : ""}`,
                    token: [arrDeviceToken[0].token],
                    data: { link: "guvipartner://Wallet" }
                }
                for (let i = 1; i < arrDeviceToken.length; i++) {
                    playload.token.push(arrDeviceToken[i].token)
                }
                this.notificationService.send(playload)
            }
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);

        }
    }

    async autoCreatePunishTicket(ticket: PunishTicketDocument) {
        try {
            const message = {
                en: `Create punish ticket ${ticket.id_view} success`,
                vi: `Tạo vé phạt ${ticket.id_view} thành công`,
            }
            const temp = `Vé phạt ${ticket.id_view} đã được tạo thành công`;
            const payloadHistory = {
                id_transaction: ticket.id_transaction,
                id_punish_ticket: ticket._id,
                id_customer: ticket.id_customer,
                id_collaborator: ticket.id_collaborator,
                title: message,
                body: message,
                title_admin: temp,
                value: ticket.punish_money,
                type: 'create_punish_ticket',
            }
            await this.historyActivitySystemService.createItem(payloadHistory);
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }


    async changePunishTicketStatus(ticket, fromStatus: string, toStatus: string, admin?: UserSystemDocument) {
        try {
            const message = {
                en: `Changed punish ticket's status from ${fromStatus} to ${toStatus}`,
                vi: `Chuyển đổi trạng thái của vé phạt từ ${fromStatus} sang ${toStatus}`,
            }
            const temp = `Chuyển đổi trạng thái của vé phạt từ ${fromStatus} sang ${toStatus}`;
            const hisroty = await this.historyActivityRepositoryService.create({
                id_admin_action: admin ? admin._id?.toString() : null,
                id_transaction: ticket.id_transaction?.toString(),
                id_punish_ticket: ticket._id?.toString(),
                id_collaborator: ticket.id_collaborator?.toString(),
                id_customer: ticket.id_customer?.toString(),
                id_order: ticket.id_order?.toString(),
                title: message,
                body: message,
                title_admin: temp,
                type: 'change_punish_ticket_status',
            });
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async systemAutoCancelTransaction(ticket) {
        try {
            const message = {
                en: `The system automatically cancels the transaction ${ticket.id_view} because there is another transaction in progress`,
                vi: `Hệ thống tự động hủy giao dịch ${ticket.id_view} do có 1 giao dịch khác đang thực hiện`,
            }
            const temp = `Hệ thống tự động hủy giao dịch ${ticket.id_view} do có 1 giao dịch khác đang thực hiện`;
            const payloadHistory = {
                id_transaction: ticket.id_transaction,
                id_punish_ticket: ticket.id_punish_ticket,
                id_collaborator: ticket.id_collaborator,
                id_customer: ticket.id_customer,
                id_order: ticket.id_order,
                title: message,
                body: message,
                title_admin: temp,
                type: 'system_cancel_transaction',
            }
            await this.historyActivitySystemService.createItem(payloadHistory);
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }



    async verifyTransaction(transaction, previousBalance: previousBalanceCollaboratorDTO) {
        try {
            const type = `verify_transaction_${transaction.type_transfer}`;

            const collaborator = await this.collaboratorRepositoryService.findOneById(transaction.id_collaborator);
            if (!collaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, "vi", null)], HttpStatus.NOT_FOUND);
            const message = {
                vi: `Duyệt lệnh ${transaction.id_view} thành công`,
                en: `Verify transaction ${transaction.id_view} success`
            }
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(transaction.id_collaborator);
            const payload = {
                id_transaction: transaction._id,
                id_collaborator: transaction.id_collaborator,
                id_customer: transaction.id_customer,
                id_punish_ticket: transaction.id_punish_ticket,
                id_order: transaction.id_order,
                id_admin_action: transaction.id_admin_action,
                id_admin_verify: transaction.id_admin_verify,
                title: message,
                body: message,
                title_admin: message.vi,
                type,
                current_work_wallet: getCollaborator.work_wallet,
                status_current_work_wallet: (previousBalance.work_wallet < getCollaborator.work_wallet) ?
                    "up" : (previousBalance.work_wallet > getCollaborator.work_wallet) ? "down" : "none",
                current_collaborator_wallet: Number(getCollaborator.collaborator_wallet),
                status_current_collaborator_wallet: (previousBalance.collaborator_wallet < Number(getCollaborator.collaborator_wallet)) ?
                    "up" : (previousBalance.collaborator_wallet > Number(getCollaborator.collaborator_wallet)) ? "down" : "none"
            }
            await this.historyActivitySystemService.createItem(payload);
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }



    async CollaboratorLate(ticket, minuteLate: number, previousBalance) {
        try {
            const collaborator = await this.collaboratorRepositoryService.findOneById(ticket.id_collaborator);
            if (!collaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, "vi", null)], HttpStatus.NOT_FOUND);
            const message = {
                vi: `Phạt CTV đi trễ ${minuteLate} phút với lệnh phạt ${ticket.id_view}`,
                en: `Penalize collaborators for being ${minuteLate} minutes late with ${ticket.id_view}`
            }
            const temp = `Phạt CTV ${ticket.punish_money} vì lý do ${ticket.note_admin || ticket.title.vi}`
            const payload: createHistoryActivityDTO = {
                id_collaborator: ticket.id_collaborator,
                id_punish_ticket: ticket._id,
                id_transaction: ticket.id_transaction,
                id_order: ticket.id_order,
                title: message,
                body: message,
                title_admin: temp,
                value: -ticket.punish_money,
                type: "verify_punish_ticket",
                current_work_wallet: collaborator.work_wallet,
                status_current_work_wallet: (previousBalance.work_wallet < collaborator.work_wallet) ?
                    "up" : (previousBalance.work_wallet > collaborator.work_wallet) ? "down" : "none",

                current_collaborator_wallet: collaborator.collaborator_wallet,
                status_current_collaborator_wallet: (previousBalance.collaborator_wallet < collaborator.collaborator_wallet) ?
                    "up" : (previousBalance.collaborator_wallet > collaborator.collaborator_wallet) ? "down" : "none",
            }
            await this.historyActivitySystemService.createItem(payload)
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async CollaboratorLate2(ticket, previousBalance) {
        try {
            const collaborator = await this.collaboratorRepositoryService.findOneById(ticket.id_collaborator);
            if (!collaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, "vi", null)], HttpStatus.NOT_FOUND);
            // const message = {
            //     vi: `Phạt CTV đi trễ ${minuteLate} phút với lệnh phạt ${ticket.id_view}`,
            //     en: `Penalize collaborators for being ${minuteLate} minutes late with ${ticket.id_view}`
            // }
            const message = {
                vi: `Phạt CTV với lệnh phạt ${ticket.id_view}`,
                en: `Penalize collaborators with ${ticket.id_view}`
            }
            // const temp = `Phạt CTV ${ticket.punish_money} vì đi trễ ${minuteLate} phút`
            const temp = `Phạt CTV với lệnh phạt ${ticket.id_view}`

            const payload: createHistoryActivityDTO = {
                id_collaborator: ticket.id_collaborator,
                id_punish_ticket: ticket._id,
                id_transaction: ticket.id_transaction,
                id_order: ticket.id_order,
                title: message,
                body: message,
                title_admin: temp,
                value: -ticket.punish_money,
                type: "system_punish_late_collaborator",

                current_work_wallet: collaborator.work_wallet,
                status_current_work_wallet: (previousBalance.work_wallet < collaborator.work_wallet) ?
                    "up" : (previousBalance.work_wallet > collaborator.work_wallet) ? "down" : "none",

                current_collaborator_wallet: collaborator.collaborator_wallet,
                status_current_collaborator_wallet: (previousBalance.collaborator_wallet < collaborator.collaborator_wallet) ?
                    "up" : (previousBalance.collaborator_wallet > collaborator.collaborator_wallet) ? "down" : "none",
            }
            await this.historyActivitySystemService.createItem(payload)
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }


    async logPunishCollaborator(ticket, punishPolicy, previousBalance) {
        try {
            const collaborator = await this.collaboratorRepositoryService.findOneById(ticket.id_collaborator);
            if (!collaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, "vi", null)], HttpStatus.NOT_FOUND);
            // const message = {
            //     vi: `Phạt CTV đi trễ ${minuteLate} phút với lệnh phạt ${ticket.id_view}`,
            //     en: `Penalize collaborators for being ${minuteLate} minutes late with ${ticket.id_view}`
            // }
            const message = {
                vi: `Phạt CTV với lệnh phạt ${ticket.id_view}, lí do ${punishPolicy.title.vi}`,
                en: `Penalize collaborators with ${ticket.id_view}, reason ${punishPolicy.title.en}`
            }
            // const temp = `Phạt CTV ${ticket.punish_money} vì đi trễ ${minuteLate} phút`
            const temp = `Phạt CTV với lệnh phạt ${ticket.id_view}, lí do ${punishPolicy.title.vi}`
            const payload: createHistoryActivityDTO = {
                id_collaborator: ticket.id_collaborator,
                id_punish_ticket: ticket._id,
                id_transaction: ticket.id_transaction,
                id_order: ticket.id_order,
                title: message,
                body: message,
                title_admin: temp,
                value: -ticket.punish_money,
                type: "punish_collaborator",

                current_work_wallet: collaborator.work_wallet,
                status_current_work_wallet: (previousBalance.work_wallet < collaborator.work_wallet) ?
                    "up" : (previousBalance.work_wallet > collaborator.work_wallet) ? "down" : "none",

                current_collaborator_wallet: collaborator.collaborator_wallet,
                status_current_collaborator_wallet: (previousBalance.collaborator_wallet < collaborator.collaborator_wallet) ?
                    "up" : (previousBalance.collaborator_wallet > collaborator.collaborator_wallet) ? "down" : "none",
            }

            await this.historyActivitySystemService.createItem(payload)
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    /**
     * 
     * @param ticket  thông tin vé phạt
     * @param previousBalance thông tin số dư trước khi hoan tiền
     * @param admin thông tin admin thực hiện hành động
     * @note có bắn thông báo và lưu lại notification
     */
    async verifyTransactionRefundPunishTicket(ticket: PunishTicketDocument, previousBalance, admin: UserSystemDocument) {
        try {

            const message = {
                vi: `Lệnh phạt ${ticket.id_view} đã được thu hồi và hoàn tiền`,
                en: `The ${ticket.id_view} penalty has been revoked and refunded`
            }
            const getTransaction = await this.transactionRepositoryService.findOneById(ticket.id_transaction);
            const collaborator = await this.collaboratorRepositoryService.findOneById(ticket.id_collaborator);
            const temp = `Lệnh phạt ${getTransaction.id_view} đã được thu hồi và hoàn tiền bởi ${admin._id}`;
            const item = await this.historyActivitySystemService.createItem({
                id_collaborator: ticket.id_collaborator,
                id_transaction: getTransaction._id,
                id_punish_ticket: getTransaction.id_punish_ticket,
                id_admin_action: admin._id,
                value: getTransaction.money,
                date_create: new Date(Date.now()).toISOString(),
                title: message,
                body: message,
                title_admin: temp,
                type: "verify_transaction_refund_punish_ticket",
                current_work_wallet: Number(collaborator.work_wallet),
                status_current_work_wallet: (previousBalance.work_wallet < collaborator.work_wallet) ?
                    "up" : (previousBalance.work_wallet > collaborator.work_wallet) ? "down" : "none",
                current_collaborator_wallet: Number(collaborator.collaborator_wallet),
                status_current_collaborator_wallet: (previousBalance.collaborator_wallet < Number(collaborator.collaborator_wallet)) ?
                    "up" : (previousBalance.collaborator_wallet > Number(collaborator.collaborator_wallet)) ? "down" : "none",
            })
            // phần bắn thông báo và lưu thông báo
            const formatMoney = await this.generalHandleService.formatMoney(getTransaction.money);

            const description = {
                vi: `Lệnh phạt ${ticket.id_view} đã được thu hồi và Bạn được hoàn ${formatMoney} từ lệnh phạt`,
                en: `The ${ticket.id_view} punish ticket has been revoked and you are refunded ${formatMoney} from the punish ticket.`,
            }
            const payloadNotification = {
                title: message,
                description: description,
                user_object: "collaborator",
                id_collaborator: collaborator._id,
                type_notification: "activity",
                id_transaction: getTransaction._id
            }
            this.notificationSystemService.newActivity(payloadNotification);
            const arrDeviceToken = await this.deviceTokenModel.find({ user_id: collaborator._id })
            if (arrDeviceToken.length > 0) {
                const playload = {
                    title: message.vi,
                    body: description.vi,
                    token: [arrDeviceToken[0].token],
                    data: { link: "guvipartner://Wallet" }
                }
                for (let i = 1; i < arrDeviceToken.length; i++) {
                    playload.token.push(arrDeviceToken[i].token)
                }
                this.notificationService.send(playload)
            }
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    // ----------------------------- Phần log lịch sử lệnh phạt -----------------------------------//
    /**
     * 
     * @param ticket object punishticket
     * @note Khi tạo lệnh phạt dùng chung 1 log lịch sử bất kể nó được tạo từ nguồn nào
     * @note Trong trường họp tạo lệnh phạt có kèm theo các điều kiện phạt cần xử lý thêm thì cần bắn thông báo thêm
     * @note Không có bắn thông báo và Không lưu thông báo lại
     */
    async createPunishTicket(ticket: PunishTicketDocument) {
        try {
            const message = {
                en: `Create punish ticket ${ticket.id_view} success`,
                vi: `Tạo vé phạt ${ticket.id_view} thành công`,
            }
            let subject = await this.collaboratorRepositoryService.findOneById(ticket.id_collaborator);
            if (!subject) {
                subject = await this.customerRepositoryService.findOneById(ticket.id_customer);
            }
            const temp = `Vé phạt ${ticket.id_view} của ${subject.id_view} đã được tạo thành công`;
            const payloadHistory = {
                id_punish_ticket: ticket._id,
                id_customer: ticket.id_customer,
                id_collaborator: ticket.id_collaborator,
                id_admin_action: ticket.id_admin_action,
                title: message,
                body: message,
                title_admin: temp,
                value: ticket.punish_money,
                type: 'create_punish_ticket',
                date_create: new Date(Date.now()).toISOString(),
            }
            await this.historyActivityRepositoryService.create(payloadHistory);
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    /**
     * 
     * @param ticket object punishticket
     * @note Khi duyệt lệnh phạt dùng chung 1 log lịch sử bất kể nó được duyệt từ nguồn nào
     * @note Trong trường họp tạo lệnh phạt có kèm theo các điều kiện phạt cần xử lý thêm 
     */
    async verifyPunishTicket(ticket: PunishTicketDocument) {
        try {
            const title = {
                en: `Verify punish ticket ${ticket.id_view} successfully`,
                vi: `Duyệt vé phạt ${ticket.id_view} thành công`,
            };
            const temp = `Duyệt vé phạt ${ticket.id_view} thành công`;
            await this.historyActivityRepositoryService.create({
                id_admin_action: ticket.id_admin_verify,
                id_collaborator: ticket.id_collaborator,
                id_customer: ticket.id_customer,
                id_punish_ticket: ticket._id,
                id_transaction: ticket.id_transaction,
                id_order: ticket.id_order,
                title: title,
                body: title,
                title_admin: temp,
                type: 'verify_punish_ticket',
                date_create: new Date(Date.now()).toISOString(),
            })
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    /**
     * 
     * @param ticket object punish ticket
     * @note khi thu hồi lệnh phạt sẽ không bắn thông báo, chỉ bắn thông báo trong phần verify revoke transaction punish ticket
     */
    async revokePunishTicket(ticket: PunishTicketDocument) {
        try {
            const message = {
                vi: `Thu hồi vé phạt ${ticket.id_view} thành công`,
                en: `Revoked punish ticket ${ticket.id_view} successfully`
            }
            const title_admin = `Thu hồi vé phạt ${ticket.id_view} thành công`;
            await this.historyActivityRepositoryService.create({
                id_admin_action: ticket.id_admin_action,
                id_punish_ticket: ticket._id,
                id_collaborator: ticket.id_collaborator,
                id_customer: ticket.id_customer,
                id_order: ticket.id_order,
                id_transaction: ticket.id_transaction,
                title: message,
                body: message,
                value: ticket.punish_money,
                title_admin: title_admin,
                type: 'revoke_punish_ticket',
                date_create: new Date(Date.now()).toISOString(),
            })
            return true;
        } catch (err) {
            console.log(err);
            throw new HttpException(err.reponse || err.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async cancelPunishTicket(ticket: PunishTicketDocument, admin: UserSystemDocument) {
        try {
            const message = {
                en: `Cancelled punish ticket ${ticket.id_view} successfully`,
                vi: `Huỷ vé phạt ${ticket.id_view} thành công`,
            }
            const title_admin = `Huỷ vé phạt ${ticket.id_view}`;
            this.historyActivityRepositoryService.create({
                id_admin_action: admin._id,
                id_collaborator: ticket.id_collaborator,
                id_customer: ticket.id_customer,
                id_punish_ticket: ticket._id,
                id_transaction: ticket.id_transaction,
                title: message,
                body: message,
                title_admin: title_admin,
                type: 'cancel_punish_ticket',
                date_create: new Date(Date.now()).toISOString(),
            })
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    // -------------------------- Phần log lịch sử của các lệnh giao dịch -------------------------------------- //
    /**
     * 
     * @param transaction object transaction
     * @note phần bắn thông báo sẽ được thêm ở nơi tạo, khi CTV tạo hoặc KH tạo. Khi hệ thống hay admin thì không cần thêm bắn thông báo 
     */
    async createTransaction(transaction) {
        try {
            const message = {
                vi: `Tạo giao dịch ${transaction.id_view} thành công`,
                en: `Create transaction ${transaction.id_view} success`
            }
            const payload = {
                id_transaction: transaction._id,
                id_collaborator: transaction.id_collaborator,
                id_customer: transaction.id_customer,
                id_punish_ticket: transaction.id_punish_ticket,
                id_order: transaction.id_order,
                id_admin_action: transaction.id_admin_action,
                title: message,
                body: message,
                title_admin: message.vi,
                type: "create_transaction",
            }
            await this.historyActivitySystemService.createItem(payload);

        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    /**
     * 
     * @param transaction object transaction
     * @param collaborator object collaborator
     * @param previousBalance  object previous số dư trước khi biến động của cộng tác viêm
     * @param admin  object admin
     * @note Có bắn thông báo và lưu thông báo lại
     */
    async verifyTopUpCollaborator(transaction: TransactionDocument, collaborator: CollaboratorDocument, previousBalance: previousBalanceCollaboratorDTO, admin?: UserSystemDocument) {
        try {
            const temp = {
                en: "Top up successfully",
                vi: "Nạp tiền thành công"
            }
            const formatMoney = await this.generalHandleService.formatMoney(transaction.money);
            const temp2 = `Phê duyệt thành công lệnh nạp ${transaction.id_view} cho CTV ${collaborator.id_view}`
            await this.historyActivityRepositoryService.create({
                id_admin_action: admin ? admin._id : null,
                id_collaborator: collaborator._id,
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "verify_transaction_top_up",
                date_create: new Date(Date.now()).toISOString(),
                value: transaction.money,
                id_transaction: transaction._id,
                current_work_wallet: collaborator.work_wallet,
                status_current_work_wallet: (previousBalance.work_wallet < collaborator.work_wallet) ?
                    "up" : (previousBalance.work_wallet > collaborator.work_wallet) ? "down" : "none",

                current_collaborator_wallet: collaborator.collaborator_wallet,
                status_current_collaborator_wallet: (previousBalance.collaborator_wallet < collaborator.collaborator_wallet) ?
                    "up" : (previousBalance.collaborator_wallet > collaborator.collaborator_wallet) ? "down" : "none",
            })

            const description = {
                vi: `Phê duyệt lệnh ${transaction.transfer_note} thành công`,
                en: `Verify ${transaction.transfer_note} Success`,
            }
            const payloadNotification = {
                title: temp,
                description: description,
                user_object: "collaborator",
                id_collaborator: collaborator._id,
                type_notification: "activity",
                id_transistion_collaborator: transaction._id
            }

            this.notificationSystemService.newActivity(payloadNotification);
            const arrDeviceToken = await this.deviceTokenModel.find({ user_id: collaborator._id })
            if (arrDeviceToken.length > 0) {
                const playload = {
                    title: "Nạp tiền thành công",
                    body: `Bạn đã nạp ${formatMoney} vào tài khoản của mình`,
                    token: [arrDeviceToken[0].token],
                    data: { link: "guvipartner://Wallet" }
                }
                for (let i = 1; i < arrDeviceToken.length; i++) {
                    playload.token.push(arrDeviceToken[i].token)
                }
                this.notificationService.send(playload)
            }
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    /**
     * 
     * @param transaction object transaction
     * @param collaborator object collaborator current
     * @param admin object admin
     * @note Số tiền đã được trừ khi tạm giữ, log này không hi 
     */
    async verifyWithDrawCollaborator(transaction: TransactionDocument, collaborator: CollaboratorDocument, admin?: UserSystemDocument) {
        try {
            const temp = {
                en: "Witdhdraw successfully",
                vi: "Rút tiền thành công"
            }
            const formatMoney = await this.generalHandleService.formatMoney(transaction.money);
            const temp2 = `Phê duyệt thành công lệnh rút ${transaction.id_view} cho CTV ${collaborator.id_view}`
            this.historyActivityRepositoryService.create({
                id_admin_action: admin._id,
                id_collaborator: collaborator._id,
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "verify_transaction_withdraw",
                date_create: new Date(Date.now()).toISOString(),
                id_transaction: transaction._id,
                current_work_wallet: collaborator.work_wallet,
                current_collaborator_wallet: collaborator.collaborator_wallet,
            })
            const description = {
                vi: `Phê duyệt lệnh ${transaction.transfer_note} thành công`,
                en: `Verify ${transaction.transfer_note} Success`,
            }
            const payloadNotification = {
                title: temp,
                description: description,
                user_object: "collaborator",
                id_collaborator: collaborator._id,
                type_notification: "activity",
                id_transistion_collaborator: transaction._id
            }
            this.notificationSystemService.newActivity(payloadNotification);
            const arrDeviceToken = await this.deviceTokenModel.find({ user_id: collaborator._id })
            if (arrDeviceToken.length > 0) {
                const playload = {
                    title: "Rút tiền thành công",
                    body: `Bạn đã rút ${formatMoney} từ tài khoản của mình`,
                    token: [arrDeviceToken[0].token],
                    data: { link: "guvipartner://Wallet" }
                }
                for (let i = 1; i < arrDeviceToken.length; i++) {
                    playload.token.push(arrDeviceToken[i].token)
                }
                this.notificationService.send(playload)
            }
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    /**
     * 
     * @param transaction object transaction
     * @param collaborator object collaborator
     * @param previousBalance số dư trước của ctv
     * @param admin admin thực hiện hành động duyệt, có thể có hoặc không
     * @note Có bắn thông báo và lưu thông báo lại
     */
    async verifyPunishCollaborator(transaction: TransactionDocument, collaborator: CollaboratorDocument, previousBalance: previousBalanceCollaboratorDTO, admin?: UserSystemDocument) {
        try {

            const getPunishTicket = await this.punishTicketRepositoryService.findOneById(transaction.id_punish_ticket.toString());
            const title = {
                en: "Punish successfully",
                vi: "Phạt tiền thành công"
            }
            const body = {
                en: `You are punished because: ${getPunishTicket.title.en}`,
                vi: `Bạn bị phạt vì: ${getPunishTicket.title.vi}`
            }
            const temp2 = `Phạt CTV với lí do: ${getPunishTicket.note_admin}, với lệnh phạt ${transaction.id_view}`
            this.historyActivityRepositoryService.create({
                id_admin_action: admin ? admin._id : null,
                id_collaborator: collaborator._id,
                title: title,
                title_admin: temp2,
                body: body,
                type: "verify_transaction_punish_ticket",
                date_create: new Date(Date.now()).toISOString(),
                value: -transaction.money,
                current_work_wallet: collaborator.work_wallet,
                status_current_work_wallet: (previousBalance.work_wallet < collaborator.work_wallet) ?
                    "up" : (previousBalance.work_wallet > collaborator.work_wallet) ? "down" : "none",

                current_collaborator_wallet: collaborator.collaborator_wallet,
                status_current_collaborator_wallet: (previousBalance.collaborator_wallet < collaborator.collaborator_wallet) ?
                    "up" : (previousBalance.collaborator_wallet > collaborator.collaborator_wallet) ? "down" : "none",

                id_punish_ticket: transaction.id_punish_ticket
            });
            const formatMoney = await this.generalHandleService.formatMoney(transaction.money);
            const description = {
                vi: `Bạn đã bị phạt ${formatMoney} vì lý do ${getPunishTicket.title.vi}`,
                en: `Punished ${formatMoney} because ${getPunishTicket.title.en}`,
            }
            const payloadNotification = {
                title: title,
                description: description,
                user_object: "collaborator",
                id_collaborator: collaborator._id,
                type_notification: "activity",
                id_transaction: transaction._id
            }
            this.notificationSystemService.newActivity(payloadNotification);
            const arrDeviceToken = await this.deviceTokenModel.find({ user_id: collaborator._id })
            if (arrDeviceToken.length > 0) {
                const playload = {
                    title: "Bạn đã bị phạt tiền",
                    body: `Bạn đã bị phạt ${formatMoney} vì lý do ${getPunishTicket.title.vi}`,
                    token: [arrDeviceToken[0].token],
                    data: { link: "guvipartner://Wallet" }
                }
                for (let i = 1; i < arrDeviceToken.length; i++) {
                    playload.token.push(arrDeviceToken[i].token)
                }
                this.notificationService.send(playload)
            }
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    /**
     * 
     * @param transaction object transaction
     * @param customer object customer
     * @param admin admin thực hiện hành động duyệt, có thể có hoặc không
     * @note có bắn thông báo và lưu lại thông báo 
     */
    async verifyTopUpCustomer(transaction: TransactionDocument, customer: CustomerDocument, admin?: UserSystemDocument) {
        try {
            const message = {
                en: 'Top up successfully',
                vi: 'Nạp thành công',
            };
            const formatMoney = await this.generalHandleService.formatMoney(transaction.money)
            const temp = `Duyệt lệnh nạp ${transaction.id_view} của khách hàng ${customer.full_name} thành công`;
            this.historyActivityRepositoryService.create({
                id_admin_action: admin ? admin._id : null,
                id_customer: customer._id,
                id_transaction: transaction._id,
                title: message,
                body: message,
                title_admin: temp,
                type: 'verify_transaction_top_up',
                current_pay_point: customer.pay_point,
                status_current_pay_point: "up",
                date_create: new Date(Date.now()).toISOString(),
                value: transaction.money
            })

            const title = {
                vi: `Nạp ${formatMoney} vào tài khoản thành công !!!`,
                en: `Top up ${formatMoney} successfully!!!`
            }
            const payload = {
                title: title,
                description: title,
                id_customer: customer._id,
                type_notification: 'activity',
                id_transaction: transaction._id
            }
            await this.notificationSystemService.newActivity(payload)
            const getAllDeviceToken = await this.deviceTokenModel.find({ user_id: customer._id });
            const arrDeviceToken = [];
            for (const item of getAllDeviceToken) {
                arrDeviceToken.push(item.token);
            }
            const payloadNoti = {
                title: "Nạp tiền vào tài khoản thành công !!!",
                body: `Tài khoản của bạn đã nạp ${formatMoney} thành công !!!`,
                token: arrDeviceToken
            }
            if (arrDeviceToken.length > 0) {
                this.notificationService.send(payloadNoti)
            }
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    /**
     * 
     * @param transaction object transaction
     * @param customer object customer
     * @param admin admin thực hiện hành động duyệt, có thể có hoặc không
     * @note có bắn thông báo và lưu lại thông báo 
     */
    async verifyWithdrawTransCustomer(transaction: TransactionDocument, customer: CustomerDocument, admin?: UserSystemDocument) {
        try {
            const message = {
                en: 'Withdraw successfully',
                vi: 'Rút tiền thành công',
            };
            const temp = `Duyệt lệnh rút ${transaction.id_view} của khách hàng ${customer.full_name} thành công`;
            const _money = await this.generalHandleService.formatMoney(transaction.money)
            const getAllDeviceToken = await this.deviceTokenModel.find({ user_id: customer._id });
            const arrDeviceToken = [];
            for (const item of getAllDeviceToken) {
                arrDeviceToken.push(item.token);
            }
            await this.historyActivityRepositoryService.create({
                id_admin_action: admin._id,
                id_customer: customer._id,
                id_transaction: transaction._id,
                title: message,
                body: message,
                title_admin: temp,
                type: 'verify_transaction_withdraw',
                current_pay_point: customer.pay_point,
                status_current_pay_point: "down",
                date_create: new Date(Date.now()).toISOString(),
                value: -transaction.money
            })

            const payloadNoti = {
                title: "Rút tiền tài khoản thành công !!!",
                body: `Tài khoản của bạn đã rút ${_money} thành công !!!`,
                token: arrDeviceToken
            }
            const titleNotification = {
                en: `Congratulation!!! You withdraw ${_money}`,
                vi: `Bạn rút ${_money} thành công`
            }

            const description = {
                en: `Congratulation!!! You withdraw ${_money}`,
                vi: `Bạn đã rút ${_money} thành công`,
            }
            const payload = {
                title: titleNotification,
                description: description,
                id_customer: customer._id,
                type_notification: 'activity',
            }
            if (arrDeviceToken.length > 0) {
                this.notificationService.send(payloadNoti)
            }
            await this.notificationSystemService.newActivity(payload)
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }
    /**
     * 
     * @param transaction object transaction
     * @param admin admin thực hiện hành động
     * @returns 
     */
    async cancelTransaction(transaction, admin?: UserSystemDocument) {
        try {
            const message = {
                en: 'Cancel transaction successfully',
                vi: 'Hủy lệnh giao dịch thành công',
            };
            const temp = `Hủy lệnh giao dịch ${transaction.id_view}`;
            await this.historyActivitySystemService.createItem({
                id_admin_action: admin ? admin._id : null,
                id_customer: transaction.id_customer,
                id_transaction: transaction._id,
                title: message,
                body: message,
                title_admin: temp,
                type: 'cancel_transaction',
                date_create: new Date(Date.now()).toISOString(),
            })
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }


    async verifyTransactionPaymentService(transaction, customer: CustomerDocument, groupOrder: GroupOrderDocument, admin?: UserSystemDocument) {
        try {
            const formatMoney = await this.generalHandleService.formatMoney(transaction.money)
            const getService = await this.serviceModel.findById(groupOrder.service._id);
            const temp = {
                en: "Payment success",
                vi: "Thanh toán thành công"
            };
            const temp2 = `${customer.id_view} thanh toán thành công ${formatMoney} cho dịch vụ ${getService.title.vi || ""} theo phưong thức G-Pay`;
            const description = {
                en: `You have successfully paid for the service ${getService.title.en || ""} with the amount ${formatMoney} for order ${groupOrder.id_view} ! \n Click to check the transaction immediately.`,
                vi: `Bạn đã thanh toán thành công cho dịch vụ ${getService.title.vi || ""} với số tiền ${formatMoney} cho đơn ${groupOrder.id_view} ! \n Nhấn để kiểm tra giao dịch ngay bạn nhé.`
            };
            this.historyActivityRepositoryService.create({
                id_admin_action: admin._id,
                id_customer: customer._id,
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "verify_transaction_payment_service",
                date_create: new Date(Date.now()).toISOString(),
                value: -transaction.money,
                current_pay_point: customer.pay_point,
                status_current_pay_point: "down",
                id_transaction: transaction._id,
                id_group_order: groupOrder._id
            })

            const payloadNotification = {
                title: temp,
                description: description,
                type_notification: 'system',
                user_object: 'customer',
                related_id: null,
                id_customer: customer._id,
            }

            this.notificationSystemService.newActivity(payloadNotification);
            const arrDeviceToken = await this.deviceTokenModel.find({ user_id: customer._id })
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

    /**
     * 
     * @param transaction object transaction
     * @param customer object customer
     * @param groupOrder object group order (có thể có hoặc không)
     * @param order object order (có thể có hoặc không)
     * @note 
     */
    async verifyTransactionRefundPaymentService(transaction, customer: CustomerDocument, groupOrder?: GroupOrderDocument, order?: OrderDocument) {
        try {

            console.log(transaction, 'transaction');
            console.log(customer, 'customer');
            console.log(groupOrder, 'groupOrder');
            console.log(order, 'order');

            
            const formatMoney = await this.generalHandleService.formatMoney(transaction.money);
            const title = {
                vi: `Hoàn tiền thành công`,
                en: `Refund money success`
            }
            const temp = {
                en: `You is refund ${formatMoney} successfully`,
                vi: `Bạn được hoàn lại ${formatMoney}`
            }
            let temp2 = `Khách hàng ${customer.id_view} đã được nhận lại ${formatMoney} vì đơn hàng ${order?.id_view || groupOrder?.id_view} bị huỷ`;
            const payloadHistory: createHistoryActivityDTO = {
                value: Number(transaction.money),
                id_transaction: transaction._id,
                title: temp,
                title_admin: temp2,
                body: temp,
                id_customer: customer._id,
                type: "verify_transaction_refund_payment_service",
                id_group_order: groupOrder._id,
                id_order: order?._id || null,
                current_pay_point: customer.pay_point,
                status_current_pay_point: "up",
                date_create: new Date(Date.now()).toISOString()
            }
            console.log(payloadHistory, 'payloadHistory');
            
            await this.historyActivityRepositoryService.create(payloadHistory)
            const description = {
                vi: `Bạn đã được hoàn ${formatMoney} vào ví Gpay do đơn ${order.id_view || groupOrder.id_view} bị hủy`,
                en: `You have been refunded ${formatMoney} to Gpay wallet because order ${order.id_view || groupOrder.id_view} was canceled`
            }
            const payloadNotiCustomer = {
                title,
                description,
                user_object: "customer",
                id_customer: customer._id,
                type_notification: "activity",
                related_id: groupOrder._id || order._id || null,
                id_group_order: groupOrder._id,
                id_order: order._id || null,
            }
            this.notificationSystemService.newActivity(payloadNotiCustomer);
            const arrDeviceToken = await this.deviceTokenModel.find({ user_id: customer._id, user_object: "customer" })
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
            console.log(err, 'err');
            
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async holdingMoney(collaborator, transaction, previousBalance, admin?: UserSystemDocument) {
        try {
            const formatMoney = await this.generalHandleService.formatMoney(transaction.money)
            const temp = {
                vi: `Hệ thống tạm giữ tiền của bạn`,
                en: `The system temporarily holds your money`
            }
            const body = {
                vi: `Hệ thống tạm giữ ${formatMoney} của bạn từ lệnh rút tiền ${transaction.id_view}`,
                en: `The system temporarily holds ${formatMoney} your money from transaction withdraw ${transaction.id_view}`
            }
            const temp2 = `Hệ thống tạm giữ ${formatMoney} của CTV ${collaborator.id_view} từ lệnh giao dịch ${transaction.id_view}`;
            await this.historyActivityRepositoryService.create({
                id_admin_action: admin?._id,
                id_collaborator: collaborator._id,
                id_transaction: transaction._id,
                title: temp,
                title_admin: temp2,
                body: body,
                type: "collaborator_holding",
                date_create: new Date(Date.now()).toISOString(),
                value: -transaction.money,
                current_work_wallet: collaborator.work_wallet,
                status_current_work_wallet: (previousBalance.work_wallet < collaborator.work_wallet) ?
                    "up" : (previousBalance.work_wallet > collaborator.work_wallet) ? "down" : "none",
                current_collaborator_wallet: collaborator.collaborator_wallet,
                status_current_collaborator_wallet: (previousBalance.collaborator_wallet < collaborator.collaborator_wallet) ?
                    "up" : (previousBalance.collaborator_wallet > collaborator.collaborator_wallet) ? "down" : "none",
            });
            this.pushNotiSystemService.pushNotiHoldingMoneyCollaborator(transaction);

            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }


    // ham nay tuong lai se dung chung cho cac muc dich hoan phi cho KH va CTV
    // async refundMoney(collaborator, platform_fee, order, service, idGroupOrder, previousBalance) {
    //     try {
    //         const temp = {
    //             vi: `Hoàn phí đơn khách ${order.name_customer}`,
    //             en: `Refund order of customer ${order.name_customer}`
    //         }
    //         const tempPlatformFee = await this.generalHandleService.formatMoney(platform_fee);
    //         const temp2 = `${collaborator.full_name} được hoàn ${platform_fee} phí dịch vụ từ công việc ${order._id}`
    //         const newItem = new this.historyActivityModel({
    //             id_collaborator: collaborator._id,
    //             title: temp,
    //             title_admin: temp2,
    //             body: temp,
    //             type: "refund_platform_fee_cancel_order",
    //             date_create: (previousBalance.date_create && previousBalance.date_create !== null)
    //                 ? previousBalance.date_create : new Date(Date.now()).toISOString(),
    //             value: platform_fee,
    //             id_order: order._id,
    //             id_group_order: idGroupOrder,

    //             current_collaborator_wallet: collaborator.collaborator_wallet,
    //             status_current_collaborator_wallet: (previousBalance.collaborator_wallet < collaborator.collaborator_wallet) ?
    //                 "up" : (previousBalance.collaborator_wallet > collaborator.collaborator_wallet) ? "down" : "none",
    //             current_work_wallet: collaborator.work_wallet,
    //             status_current_work_wallet: (previousBalance.work_wallet < collaborator.work_wallet) ?
    //                 "up" : (previousBalance.work_wallet > collaborator.work_wallet) ? "down" : "none",
    //         })
    //         const description = {
    //             vi: `Ca làm ${order.id_view} đã bị hủy. Bạn được hoàn lại số tiền ${tempPlatformFee} vào "Ví Nạp" `,
    //             en: `Shift ${order.id_view} has been canceled. You will receive a refund of ${tempPlatformFee} to "Deposit Wallet"`
    //         }
    //         const title = {
    //             vi: `Hoàn tiền thành công`,
    //             en: `Refund money success`
    //         }
    //         const payloadNotification = {
    //             title: title,
    //             description: description,
    //             user_object: "collaborator",
    //             id_collaborator: collaborator._id,
    //             type_notification: "activity",
    //             related_id: order._id,
    //             id_order: order._id
    //         }
    //         await newItem.save();
    //         this.notificationSystemService.newActivity(payloadNotification);

    //         const arrDeviceToken = await this.deviceTokenModel.find({ user_id: collaborator._id, user_object: "collaborator" })
    //         if (arrDeviceToken.length > 0) {
    //             const payload = {
    //                 title: title.vi,
    //                 body: description.vi,
    //                 token: [arrDeviceToken[0].token],
    //                 data: { link: "guvipartner://Wallet" }

    //             }
    //             for (let i = 1; i < arrDeviceToken.length; i++) {
    //                 payload.token.push(arrDeviceToken[i].token)
    //             }
    //             this.notificationService.send(payload)
    //         }
    //         return true;
    //     } catch (err) {
    //         // this.logger.error(err.response || err.toString());
    //         throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
    //     }
    // }
    




    async fillPayloadDependency(title, body, title_admin, payloadDependency, iduserAction) { 
        try {
            const payload = {
                title,
                body,
                title_admin,
                id_user_action: iduserAction,
                id_customer: payloadDependency.id_customer || null,
                id_admin_action: payloadDependency.id_admin_action || null,
                id_group_order: payloadDependency.id_group_order || null,
                id_order: payloadDependency.id_order || null,
                id_collaborator: payloadDependency.id_collaborator || null,
                id_reason_cancel: payloadDependency.id_reason_cancel || null,
                date_create: new Date(Date.now()).toISOString()
            }
            return payload;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }



    async unassignCollaboratorFromGroupOrder(groupOrder, collaborator, idAdmin){
        try {
            const title = {
                vi: `Admin đã hỗ trợ gỡ bạn khỏi ca làm`,
                en: `Admin has assisted in removing you from your shift`
            }
            const body = title
            const titleAdmin = `Admin đã đẩy CTV ra khỏi dịch vụ ${groupOrder._id}`;
            await this.historyActivityRepositoryService.create({
                id_admin_action: idAdmin || null,
                id_collaborator: collaborator._id,
                id_group_order: groupOrder._id,
                title: title,
                title_admin: titleAdmin,
                body: body,
                type: "unassign_group_order_collaborator",
                date_create: new Date(Date.now()).toISOString(),
            });

            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    async unassignCollaboratorFromOrder(order, collaborator, idAdmin){
        try {
            const title = {
                vi: `Admin đã hỗ trợ gỡ bạn khỏi dịch vụ`,
                en: `Admin has assisted in removing you from your service`
            }
            const body = title
            const titleAdmin = `Admin đã đẩy CTV ra khỏi ca làm ${order.id_view}`;
            await this.historyActivityRepositoryService.create({
                id_admin_action: idAdmin || null,
                id_collaborator: collaborator._id,
                id_group_order: order.id_group_order,
                id_order: order._id,
                title: title,
                title_admin: titleAdmin,
                body: body,
                type: "unassign_order_collaborator",
                date_create: new Date(Date.now()).toISOString(),
            });

            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }



    async refundCollaborator(subjectAction, payloadDependency, money, previousBalance) {
        try {
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(payloadDependency.id_collaborator);
            const getOrder = await this.orderRepositoryService.findOneById(payloadDependency.id_order)
            
            const title = {
                vi: `Hoàn tiền thành công`,
                en: `Refund success`
            }
            const titleAdmin = `Hoàn tiền cho CTV ${getCollaborator.full_name} từ đơn hàng ${getOrder.id_view}`;
            await this.historyActivityRepositoryService.create({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction._id),
                type: "collaborator_refund_money",
                value: money || 0,
                current_collaborator_wallet: getCollaborator.collaborator_wallet,
                status_current_collaborator_wallet: (previousBalance.collaborator_wallet < getCollaborator.collaborator_wallet) ?
                    "up" : (previousBalance.collaborator_wallet > getCollaborator.collaborator_wallet) ? "down" : "none",
                current_work_wallet: getCollaborator.work_wallet,
                status_current_work_wallet: (previousBalance.work_wallet < getCollaborator.work_wallet) ?
                    "up" : (previousBalance.work_wallet > getCollaborator.work_wallet) ? "down" : "none",
            });

            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async refundCustomer(subjectAction, payloadDependency, money) {
        try {
            const getCustomer = await this.customerRepositoryService.findOneById(payloadDependency.id_customer)
            let title = {
                vi: "Hoàn tiền dịch vụ",
                en: "Refund service"
            }
            let titleAdmin = `Hoàn tiền cho khách hàng`
            await this.historyActivityRepositoryService.create({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction._id),
                type: "customer_refund_money",
                value: money || 0,
                current_pay_point: getCustomer.pay_point,
                status_current_pay_point: "up",
            })

            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    // async cancelGroupOrder(subjectAction, payloadDependency) {
    //     try {
    //         const groupOrder = await this.groupOrderRepositoryService.findOneById(payloadDependency.id_group_order);
    //         const reasonCancel = await this.reasonsCancelRepositoryService.findOneById(payloadDependency.id_reason_cancel)

    //         let title = {
    //             vi: `Dịch vụ ${groupOrder.id_view || null} đã bị hủy`,
    //             en: `Dịch vụ ${groupOrder.id_view || null} đã bị hủy`
    //         }
    //         let titleAdmin = `Dịch vụ ${groupOrder.id_view || null} đã bị hủy với lí do ${reasonCancel.title.vi}`
    //         await this.historyActivityRepositoryService.create({
    //             ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction),
    //             type: "cancel_group_order"
    //         })
    //         return true;
    //     } catch (err) {
    //         throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    //     }
    // }

    async cancelGroupOrder(subjectAction, payloadDependency) {
        try {
            const groupOrder = await this.groupOrderRepositoryService.findOneById(payloadDependency.id_group_order);
            const reasonCancel = await this.reasonsCancelRepositoryService.findOneById(payloadDependency.id_reason_cancel)

            payloadDependency.id_customer = payloadDependency.id_customer || null;
            payloadDependency.id_collaborator = payloadDependency.id_collaborator || null;
            payloadDependency.id_admin_action = payloadDependency.id_admin_action || null

            let type = 'system_cancel_group_order'
            let title = {
                vi: `Dịch vụ ${groupOrder.id_view || null} đã bị hủy`,
                en: `Dịch vụ ${groupOrder.id_view || null} đã bị hủy`
            }
            let titleAdmin = `Dịch vụ ${groupOrder.id_view || null} đã bị hủy với lí do ${reasonCancel.title.vi}`
            if(payloadDependency.id_customer !== null && subjectAction === payloadDependency.id_customer.toString()){
                const getCustomer = await this.customerRepositoryService.findOneById(payloadDependency.id_customer);

                type = 'customer_cancel_group_order'
                title = {
                vi: `Dịch vụ ${groupOrder.id_view || null} đã bị hủy`,
                en: `Dịch vụ ${groupOrder.id_view || null} đã bị hủy`
                }
                titleAdmin = `${getCustomer.full_name} Hủy dịch vụ ${groupOrder.id_view } với lí do ${reasonCancel.title.vi}`
            }
            else if(payloadDependency.id_collaborator !== null && subjectAction === payloadDependency.id_collaborator.toString()){
                const getCollaborator = await this.collaboratorRepositoryService.findOneById(payloadDependency.id_collaborator);
                type = 'collaborator_cancel_group_order',
                title = {
                vi: `Dịch vụ ${groupOrder.id_view || null} đã bị hủy`,
                en: `Dịch vụ ${groupOrder.id_view || null} đã bị hủy`
                }
                titleAdmin = `${getCollaborator.full_name} Hủy ca làm ${groupOrder.id_view } với lí do ${reasonCancel.title.vi}`
            }
            else if(payloadDependency.id_admin_action !== null && subjectAction === payloadDependency.id_admin_action.toString()){
                type = 'admin_cancel_group_order',
                title = {
                vi: `Dịch vụ ${groupOrder.id_view || null} đã bị hủy`,
                en: `Dịch vụ ${groupOrder.id_view || null} đã bị hủy`
                }
                titleAdmin = `Hủy ca làm ${groupOrder.id_view } với lí do ${reasonCancel.title.vi}`
            }


            await this.historyActivityRepositoryService.create({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction._id),
                type: type
            })
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async cancelOrder(subjectAction, payloadDependency) {
        try {
            const order = await this.orderRepositoryService.findOneById(payloadDependency.id_order);
            const reasonCancel = await this.reasonsCancelRepositoryService.findOneById(payloadDependency.id_reason_cancel)
            
            let type = 'system_cancel_order'
            let title = {
                vi: `Ca làm ${order.id_view || null} đã bị hủy`,
                en: `Order ${order.id_view || null} is canceled`
            }
            let titleAdmin = `Ca làm ${order.id_view } đã bị hủy với lí do ${reasonCancel.title.vi}`
            // if(payloadDependency.id_customer !== null && subjectAction === payloadDependency.id_customer.toString()){
            if(subjectAction.type === "customer"){

                const getCustomer = await this.customerRepositoryService.findOneById(payloadDependency.id_customer);

                type = 'customer_cancel_order'
                title = {
                    vi: `Ca làm ${order.id_view || null} đã bị hủy`,
                    en: `Order ${order.id_view || null} is canceled`
                }
                titleAdmin = `KH ${getCustomer.full_name} Hủy ca làm ${order.id_view } với lí do ${reasonCancel.title.vi}`
            }
            // else if(payloadDependency.id_collaborator !== null && subjectAction === payloadDependency.id_collaborator.toString()){
            else if(subjectAction.type === "collaborator"){
                const getCollaborator = await this.collaboratorRepositoryService.findOneById(payloadDependency.id_collaborator);
                type = 'collaborator_cancel_order',
                title = {
                    vi: `Ca làm ${order.id_view || null} đã bị hủy`,
                    en: `Order ${order.id_view || null} is canceled`
                }
                titleAdmin = `CTV ${getCollaborator.full_name} Hủy ca làm ${order.id_view } với lí do ${reasonCancel.title.vi}`
            }
            // else if(payloadDependency.id_admin_action !== null && subjectAction === payloadDependency.id_admin_action.toString()){
            else if(subjectAction.type === "admin"){
                type = 'admin_cancel_order',
                title = {
                    vi: `Ca làm ${order.id_view || null} đã bị hủy`,
                    en: `Order ${order.id_view || null} is canceled`
                }
                titleAdmin = `QTV Hủy ca làm ${order.id_view } với lí do ${reasonCancel.title.vi}`
                const getAdmin = await this.userSystemRepositoryService.findOneById(payloadDependency.id_admin_action)
                if(getAdmin) {
                    titleAdmin = `QTV ${getAdmin.full_name} Hủy ca làm ${order.id_view } với lí do ${reasonCancel.title.vi}`
                }
            }

            this.historyActivityRepositoryService.create({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction._id),
                type: type
            })
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }



    async minusPlatformFee(subjectAction, payloadDependency, money, previousBalance) {
        try {
            const order = await this.orderRepositoryService.findOneById(payloadDependency.id_order);
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(payloadDependency.id_collaborator);
            let title = {
                vi: `Thu phí dịch vụ ca làm ${order.id_view}`,
                en: `Collect shift service fees ${order.id_view}`
            }
            let titleAdmin = `Thu phí dịch vụ ca làm ${order.id_view}`
            this.historyActivityRepositoryService.create({
                ...await this.fillPayloadDependency(title, title, titleAdmin, payloadDependency, subjectAction._id),
                type: "collaborator_minus_platform_fee",
                value: -money,
                current_collaborator_wallet: getCollaborator.collaborator_wallet,
                status_current_collaborator_wallet: (previousBalance.collaborator_wallet < getCollaborator.collaborator_wallet) ?
                    "up" : (previousBalance.collaborator_wallet > getCollaborator.collaborator_wallet) ? "down" : "none",
                current_work_wallet: getCollaborator.work_wallet,
                status_current_work_wallet: (previousBalance.work_wallet < getCollaborator.work_wallet) ?
                    "up" : (previousBalance.work_wallet > getCollaborator.work_wallet) ? "down" : "none",
            })
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
