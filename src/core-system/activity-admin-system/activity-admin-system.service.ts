import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { ERROR, OPTIONS_SELECT_STATUS_COLLABORATOR, POP_COLLABORATOR_INFO, POP_CUSTOMER_INFO, previousBalanceCollaboratorDTO } from 'src/@core'
import { createHistoryActivityDTO } from 'src/@core/dto/historyActivity.dto'
import { pushNotiDTO } from 'src/@core/dto/push_notification.dto'
import { Banner, BannerDocument, Collaborator, CollaboratorDocument, Customer, CustomerDocument, DeviceToken, DeviceTokenDocument, ExtendOptional, HistoryActivity, HistoryActivityDocument, HistoryOrder, HistoryOrderDocument, InfoRewardCollaborator, InfoRewardCollaboratorDocument, Order, OrderDocument, Service, ServiceDocument, TransitionCollaborator, TransitionCollaboratorDocument, TransitionCustomer, TransitionCustomerDocument, UserSystem, UserSystemDocument } from 'src/@repositories/module/mongodb/@database'
import { CollaboratorBonus, CollaboratorBonusDocument } from 'src/@repositories/module/mongodb/@database/schema/collaborator_bonus.schema'
import { ExamTest, ExamTestDocument } from 'src/@repositories/module/mongodb/@database/schema/examtest_collaborator.schema'
import { GroupOrder, GroupOrderDocument } from 'src/@repositories/module/mongodb/@database/schema/group_order.schema'
import { InfoTestCollaborator } from 'src/@repositories/module/mongodb/@database/schema/info_test_collaborator.schema'
import { Punish, PunishDocument } from 'src/@repositories/module/mongodb/@database/schema/punish.schema'
import { RewardCollaborator, RewardCollaboratorDocument } from 'src/@repositories/module/mongodb/@database/schema/reward_collaborator.schema'
import { TransactionDocument } from 'src/@repositories/module/mongodb/@database/schema/transaction.schema'
import { CollaboratorRepositoryService } from 'src/@repositories/repository-service/collaborator-repository/collaborator-repository.service'
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
@Injectable()
export class ActivityAdminSystemService {
    constructor(
        private customExceptionService: CustomExceptionService,
        private notificationService: NotificationService,
        private notificationSystemService: NotificationSystemService,
        private generalHandleService: GeneralHandleService,
        private pushNotiSystemService: PushNotiSystemService,
        private collaboratorSystemService: CollaboratorSystemService,
        private collaboratorRepositoryService: CollaboratorRepositoryService,
        private transactionRepositoryService: TransactionRepositoryService,
        private historyActivityRepositoryService: HistoryActivityRepositoryService,
        private historyActivitySystemService: HistoryActivitySystemService,
        private customerRepositoryService: CustomerRepositoryService,
        private userSystemRepositoryService: UserSystemRepositoryService,

        @InjectModel(HistoryOrder.name) private historyOrderModel: Model<HistoryOrderDocument>,
        @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
        @InjectModel(Punish.name) private punishModel: Model<PunishDocument>,
        @InjectModel(UserSystem.name) private userSystemModel: Model<UserSystemDocument>,
        @InjectModel(Collaborator.name) private collaboratorModel: Model<CollaboratorDocument>,
        @InjectModel(GroupOrder.name) private groupOrderModel: Model<GroupOrderDocument>,
        @InjectModel(Order.name) private oderModel: Model<OrderDocument>,
        @InjectModel(DeviceToken.name) private deviceTokenModel: Model<DeviceTokenDocument>,
        @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
        @InjectModel(HistoryActivity.name) private historyActivityModel: Model<HistoryActivityDocument>,
        @InjectModel(TransitionCollaborator.name) private transitionCollaboratorModel: Model<TransitionCollaboratorDocument>,
        @InjectModel(TransitionCustomer.name) private transitionCustomerModel: Model<TransitionCustomerDocument>,
        @InjectModel(Banner.name) private bannerModel: Model<BannerDocument>,
        @InjectModel(ExtendOptional.name) private extendOptionalModel: Model<ExtendOptional>,
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @InjectModel(ExamTest.name) private examTestModel: Model<ExamTestDocument>,
        @InjectModel(InfoTestCollaborator.name) private infoTestCollaboratorModel: Model<ExamTestDocument>,
        @InjectModel(RewardCollaborator.name) private rewardCollaboratorModel: Model<RewardCollaboratorDocument>,
        @InjectModel(CollaboratorBonus.name) private collaboratorBonusModel: Model<CollaboratorBonusDocument>,
        @InjectModel(InfoRewardCollaborator.name) private infoRewardCollaboratorModel: Model<InfoRewardCollaboratorDocument>,



    ) { }

    /////////////////////////////////// collaborators //////////////////////////////////////////////////////////////////
    async verifyTopUpCollaborator(transaction: TransactionDocument, admin, collaborator: CollaboratorDocument, previousBalance) {
        try {
            const temp = {
                en: "Top up successfully",
                vi: "Nạp tiền thành công"
            }
            const formatMoney = await this.generalHandleService.formatMoney(transaction.money);
            const temp2 = `${admin._id} phê duyệt thành công lệnh nạp ${transaction.id_view} cho CTV ${collaborator._id}`
            const newItem = new this.historyActivityModel({
                id_admin_action: admin._id,
                id_collaborator: collaborator._id,
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "verify_top_up",
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
            await newItem.save();
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
            await newItem.save();
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
            // this.logger.error(err.response || err.toString());
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async verifyRefundCollaborator(transaction: TransactionDocument, admin, collaborator: CollaboratorDocument, previousBalance) {
        try {
            const temp = {
                en: "Refund successfully",
                vi: "Hoàn tiền thành công"
            }
            const formatMoney = await this.generalHandleService.formatMoney(transaction.money);
            const temp2 = `${admin._id} phê duyệt thành công lệnh hoàn tiền ${transaction.id_view} cho CTV ${collaborator._id}`
            const newItem = new this.historyActivityModel({
                id_admin_action: admin._id,
                id_collaborator: collaborator._id,
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "verify_refund",
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
            await newItem.save();
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
            await newItem.save();
            this.notificationSystemService.newActivity(payloadNotification);
            // const payloadNotification = {
            //     title: title,
            //     description: description,
            //     user_object: "collaborator",
            //     user_id: [idCollaborator],
            //     type_notification: "system",
            //     related_id: idOrder,
            // }
            // this.notificationSystemService.newActivity(payloadNotification);
            const arrDeviceToken = await this.deviceTokenModel.find({ user_id: collaborator._id })
            if (arrDeviceToken.length > 0) {
                const playload = {
                    title: "Hoàn tiền thành công",
                    body: `Bạn đã được hoàn ${formatMoney} vào tài khoản của mình`,
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
            // this.logger.error(err.response || err.toString());
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async verifyRewardCollaborator(transaction: TransactionDocument, admin, collaborator: CollaboratorDocument, previousBalance) {
        try {
            const temp = {
                en: "Reward successfully",
                vi: "Thưởng tiền thành công"
            }
            const formatMoney = await this.generalHandleService.formatMoney(transaction.money);
            const temp2 = `${admin._id} phê duyệt thành công lệnh thưởng tiền ${transaction.id_view} cho CTV ${collaborator._id}`
            const newItem = new this.historyActivityModel({
                id_admin_action: admin._id,
                id_collaborator: collaborator._id,
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "verify_reward",
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
            await newItem.save();
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
            await newItem.save();
            this.notificationSystemService.newActivity(payloadNotification);
            // const payloadNotification = {
            //     title: title,
            //     description: description,
            //     user_object: "collaborator",
            //     user_id: [idCollaborator],
            //     type_notification: "system",
            //     related_id: idOrder,
            // }
            // this.notificationSystemService.newActivity(payloadNotification);
            const arrDeviceToken = await this.deviceTokenModel.find({ user_id: collaborator._id })
            if (arrDeviceToken.length > 0) {
                const playload = {
                    title: "Thưởng tiền thành công",
                    body: `Bạn đã được thưởng ${formatMoney} vào tài khoản của mình`,
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
            // this.logger.error(err.response || err.toString());
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async verifyWithDrawCollaborator(idTransistion, idAdmin, collaborator: CollaboratorDocument, previousBalance) {
        try {
            const temp = {
                en: "Witdhdraw successfully",
                vi: "Rút tiền thành công"
            }
            const getAdmin = await this.userSystemRepositoryService.findOneById(idAdmin);
            const getTransition = await this.transactionRepositoryService.findOneById(idTransistion);
            const temp2 = `${getAdmin._id} phê duyệt thành công lệnh rút ${getTransition.id_view} cho CTV ${collaborator._id}`
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_collaborator: collaborator._id,
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "verify_withdraw",
                date_create: new Date(Date.now()).toISOString(),
                value: -getTransition.money,
                current_work_wallet: collaborator.work_wallet,
                status_current_work_wallet: (previousBalance.work_wallet < collaborator.work_wallet) ?
                    "up" : (previousBalance.work_wallet > collaborator.work_wallet) ? "down" : "none",
                current_collaborator_wallet: collaborator.collaborator_wallet,
                status_current_collaborator_wallet: (previousBalance.collaborator_wallet < collaborator.collaborator_wallet) ?
                    "up" : (previousBalance.collaborator_wallet > collaborator.collaborator_wallet) ? "down" : "none",
                id_transaction: idTransistion
            })
            await newItem.save();
            const arrDeviceToken = await this.deviceTokenModel.find({ user_id: collaborator._id })
            if (arrDeviceToken.length > 0) {
                const playload = {
                    title: "Rút tiền thành công",
                    body: `Bạn đã rút ${getTransition.money} từ tài khoản của mình`,
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

    async verifyPunishCollaborator(idTransistion, idAdmin, collaborator: CollaboratorDocument, previousBalance) {
        try {
            const temp = {
                en: "Punish successfully",
                vi: "Phạt tiền thành công"
            }
            const getAdmin = await this.userSystemRepositoryService.findOneById(idAdmin);
            const getTransition = await this.transactionRepositoryService.findOneById(idTransistion);
            const temp2 = `${getAdmin._id} phê duyệt thành công lệnh phạt ${getTransition.id_view} cho CTV ${collaborator._id}`
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_collaborator: collaborator._id,
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "verify_punish_ticket",
                date_create: new Date(Date.now()).toISOString(),
                value: -getTransition.money,
                current_work_wallet: collaborator.work_wallet,
                status_current_work_wallet: (previousBalance.work_wallet < collaborator.work_wallet) ?
                    "up" : (previousBalance.work_wallet > collaborator.work_wallet) ? "down" : "none",

                current_collaborator_wallet: collaborator.collaborator_wallet,
                status_current_collaborator_wallet: (previousBalance.collaborator_wallet < collaborator.collaborator_wallet) ?
                    "up" : (previousBalance.collaborator_wallet > collaborator.collaborator_wallet) ? "down" : "none",
                id_punish_ticket: getTransition.id_punish_ticket
            })
            await newItem.save();
            const arrDeviceToken = await this.deviceTokenModel.find({ user_id: collaborator._id })
            if (arrDeviceToken.length > 0) {
                const playload = {
                    title: "Bạn đã bị phạt tiền",
                    body: `Bạn đã bị phạt ${getTransition.money}`,
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

    // async verifyPayServiceCollaborator(idTransistion, idAdmin, collaborator: CollaboratorDocument, previousBalance) {
    //     try {
    //         const temp = {
    //             en: "Pay service successfully",
    //             vi: "Thanh toán tiền dịch vụ thành công"
    //         }
    //         const getAdmin = await this.userSystemModel.findById(idAdmin);
    //         const getTransition = await this.transitionCollaboratorModel.findById(idTransistion);

    //         const temp2 = `${getAdmin._id} phê duyệt thành công lệnh thanh toán dịch vụ ${getTransition._id} cho CTV ${collaborator._id}`

    //         const newItem = new this.historyActivityModel({
    //             id_admin_action: idAdmin,
    //             id_collaborator: collaborator._id,
    //             title: temp,
    //             title_admin: temp2,
    //             body: temp,
    //             type: "verify_punish",
    //             date_create: new Date(Date.now()).toISOString(),
    //             value: -getTransition.money,
    //             current_remainder: collaborator.remainder,
    //             status_current_remainder: (previousBalance.remainder < collaborator.remainder) ?
    //                 "up" : (previousBalance.remainder > collaborator.remainder) ? "down" : "none",
    //             current_gift_remainder: collaborator.gift_remainder,
    //             status_current_gift_remainder: (previousBalance.gift_remainder < collaborator.gift_remainder) ?
    //                 "up" : (previousBalance.gift_remainder > collaborator.gift_remainder) ? "down" : "none",


    //             current_work_wallet: collaborator.work_wallet,
    //             status_current_work_wallet: (previousBalance.work_wallet < collaborator.work_wallet) ?
    //                 "up" : (previousBalance.work_wallet > collaborator.work_wallet) ? "down" : "none",

    //             current_collaborator_wallet: collaborator.collaborator_wallet,
    //             status_current_collaborator_wallet: (previousBalance.collaborator_wallet < collaborator.collaborator_wallet) ?
    //                 "up" : (previousBalance.collaborator_wallet > collaborator.collaborator_wallet) ? "down" : "none",

    //         })
    //         await newItem.save();
    //         const arrDeviceToken = await this.deviceTokenModel.find({ user_id: collaborator._id })
    //         if (arrDeviceToken.length > 0) {
    //             const playload = {
    //                 title: "Bạn đã bị phạt tiền",
    //                 body: `Bạn đã bị phạt ${getTransition.money}`,
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

    async createCollaborator(idAdmin: string, idCollaborator: string) {
        try {
            const message = {
                en: 'Create collaborator successfully',
                vi: 'Tạo mới cộng tác viên thành công',
            };
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(idCollaborator);
            const getAdmin = await this.userSystemRepositoryService.findOneById(idAdmin);
            const temp2 = `${getAdmin._id} đã tạo mới cộng tác viên ${getCollaborator._id}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_collaborator: idCollaborator,
                title: message,
                body: message,
                title_admin: temp2,
                type: 'admin_create_user',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async verifyCollaborator(idAdmin: string, idCollaborator: string) {
        try {
            const message = {
                en: 'Verified collaborator',
                vi: 'Đã phê duyệt cộng tác viên',
            }
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(idCollaborator);
            const getAdmin = await this.userSystemRepositoryService.findOneById(idAdmin);
            const temp = `${getAdmin._id} đã phê duyệt cho cộng tác viên ${getCollaborator._id}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_collaborator: idCollaborator,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_verify_user',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();

            const arrDeviceToken = await this.deviceTokenModel.find({ user_id: idCollaborator })
            if (arrDeviceToken.length > 0) {
                const playload = {
                    title: "Phê duyệt thành công",
                    body: `Bạn đã được phê duyệt tài khoản của mình`,
                    token: [arrDeviceToken[0].token]
                }
                for (let i = 1; i < arrDeviceToken.length; i++) {
                    playload.token.push(arrDeviceToken[i].token)
                }
                this.notificationService.send(playload)
            }
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async editCollaborator(idAdmin: string, idCollaborator: string) {
        try {
            const message = {
                en: 'Edit collaborator',
                vi: 'Đã chỉnh sửa thông tin cộng tác viên',
            }
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(idCollaborator);
            const getAdmin = await this.userSystemModel.findById(idAdmin);
            const temp = `${getAdmin._id} đã chỉnh sửa thông tin cộng tác viên ${getCollaborator._id}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_collaborator: idCollaborator,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_edit_user',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async actiCollaborator(idAdmin: string, idCollaborator: string) {
        try {
            const message = {
                en: 'Changed active collaborator',
                vi: 'Đã thay đổi trạng thái của cộng tác viên',
            }
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(idCollaborator);
            const getAdmin = await this.userSystemModel.findById(idAdmin);
            const temp = `${getAdmin._id} đã thay đổi trạng thái của cộng tác viên ${getCollaborator._id}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_collaborator: idCollaborator,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_acti_user',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async deleteCollaborator(idAdmin: string, idCollaborator: string) {
        try {
            const message = {
                en: 'Deleted collaborator',
                vi: 'Đã xóa cộng tác viên',
            }
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(idCollaborator);
            const getAdmin = await this.userSystemModel.findById(idAdmin);
            const temp = `${getAdmin._id} đã xóa tác viên ${getCollaborator._id}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_collaborator: idCollaborator,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_delete_user',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async lockCollaborator(idAdmin: string, idCollaborator: string, is_lock_time: boolean) {
        try {
            const message = {
                en: `${is_lock_time ? 'Locked' : 'Unlocked'} collaborator`,
                vi: `Đã ${is_lock_time ? 'khóa' : 'mở khóa'} cộng tác viên`,
            }
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(idCollaborator);
            const getAdmin = await this.userSystemModel.findById(idAdmin);
            const temp = `${getAdmin._id} đã ${is_lock_time ? 'khóa' : 'mở khóa'} tác viên ${getCollaborator._id}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_collaborator: idCollaborator,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_lock_user',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async topUpCollaborator(admin: UserSystemDocument, collaborator: CollaboratorDocument, transfer: TransactionDocument) {
        try {
            const message = {
                en: 'Create top up collaborator',
                vi: 'Đã tạo lệnh nạp tiền cho cộng tác viên',
            }
            const temp = `${admin._id} đã tạo lệnh nạp ${transfer._id} cho tác viên ${collaborator._id}`;
            const newItem = await this.historyActivitySystemService.createItem({
                id_admin_action: admin._id,
                id_collaborator: collaborator._id,
                id_transaction: transfer._id,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_top_up_user',
                date_create: new Date(Date.now()).toISOString(),
                value: transfer.money
            })
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async withdrawCollaborator(admin: UserSystemDocument, collaborator: CollaboratorDocument, transfer: TransactionDocument) {
        try {
            const message = {
                en: 'Withdraw of collaborator',
                vi: 'Đã tạo lệnh rút tiền của cộng tác viên',
            }
            const temp = `${admin._id} đã tạo lệnh rút ${transfer._id} của cộng tác viên ${collaborator._id}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: admin._id,
                id_collaborator: collaborator._id,
                id_transaction: transfer._id,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_withdraw_user',
                date_create: new Date(Date.now()).toISOString(),
                value: transfer.money
            })
            await newItem.save();

            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async holdingMoney(collaborator, transaction, admin, previousBalance) {
        try {
            const temp = {
                vi: `Hệ thống tạm giữ tiền của CTV ${collaborator.id_view}`,
                en: `System hold collaborator ${collaborator.id_view}'s money temporarly`
            }
            const temp2 = `Hệ thống tạm giữ tiền của CTV ${collaborator.id_view}`;
            if (transaction.payment_out === "collaborator_wallet") {
                await this.historyActivitySystemService.createItem({
                    id_admin_action: admin._id,
                    id_collaborator: collaborator._id,
                    id_transaction: transaction._id,
                    title: temp,
                    title_admin: temp2,
                    body: temp,
                    type: "collaborator_holding",
                    date_create: new Date(Date.now()).toISOString(),
                    value: -transaction.money,
                    status_current_collaborator_wallet: "down",
                    current_collaborator_wallet: collaborator.collaborator_wallet - transaction.money,
                    status_current_work_wallet: "none",
                    current_work_wallet: previousBalance.work_wallet,
                })
            } else {
                await this.historyActivitySystemService.createItem({
                    id_collaborator: collaborator._id,
                    id_transaction: transaction._id,
                    title: temp,
                    title_admin: temp2,
                    body: temp,
                    type: "collaborator_holding",
                    date_create: new Date(Date.now()).toISOString(),
                    value: -transaction.money,
                    status_current_work_wallet: "down",
                    current_work_wallet: collaborator.work_wallet - transaction.money,
                    status_current_collaborator_wallet: "none",
                    current_collaborator_wallet: previousBalance.collaborator_wallet,
                })
            }
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }



    async rewardCollaborator(admin: UserSystemDocument, collaborator: CollaboratorDocument, transfer: TransactionDocument) {
        try {
            const message = {
                en: 'Reward of collaborator',
                vi: 'Đã tạo lệnh thưởng cho cộng tác viên',
            }
            const temp = `${admin._id} đã tạo lệnh thưởng ${transfer._id} cho cộng tác viên ${collaborator._id}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: admin._id,
                id_collaborator: collaborator._id,
                id_transaction: transfer._id,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_reward_collaborator',
                date_create: new Date(Date.now()).toISOString(),
                value: transfer.money
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }
    async editTransCollaborator(idAdmin: string, idCollaborator: Collaborator, idTransfer: number) {
        try {
            const message = {
                en: 'Edit transfer of collaborator',
                vi: 'Đã chỉnh sửa lệnh của cộng tác viên',
            }
            const temp = `${idAdmin} đã chỉnh sửa lệnh nạp ${idTransfer} của cộng tác viên ${idCollaborator}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_collaborator: idCollaborator,
                id_transistion_collaborator: idTransfer,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_edit_transfer_user',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();

            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async deleteTransCollaborator(idAdmin: string, idCollaborator: Collaborator, idTransfer: string, id_view?: string) {
        try {
            const message = {
                en: 'Edit transfer of collaborator',
                vi: 'Đã xóa lệnh rút/nạp của cộng tác viên',
            }
            const temp = `${idAdmin} đã xóa lệnh rút/nạp ${id_view !== undefined ? id_view : idTransfer} của cộng tác viên ${idCollaborator}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_collaborator: idCollaborator,
                id_transistion: idTransfer,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_delete_transfer_user',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async cancelTransCollaborator(admin: UserSystemDocument, collaborator: CollaboratorDocument, transaction: TransactionDocument) {
        try {
            const message = {
                en: 'Cancel transfer of collaborator',
                vi: 'Đã hủy lệnh rút/nạp của cộng tác viên',
            }
            const temp = `${admin._id} đã hủy lệnh rút/nạp ${transaction._id} của cộng tác viên ${collaborator._id}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: admin._id,
                id_collaborator: collaborator._id,
                id_transaction: transaction._id,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_cancel_transfer_user',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async cancelTransationStaff(adminAction: UserSystemDocument, admin: CollaboratorDocument, transaction: TransactionDocument) {
        try {
            const message = {
                en: 'Canceled the system employee transaction',
                vi: 'Đã hủy giao dịch của nhân viên quản trị',
            }
            const temp = `${adminAction._id} đã hủy lệnh giao dịch ${transaction._id} của nhân viên quản trị ${admin._id}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: admin._id,
                id_user_system: admin._id,
                id_transaction: transaction._id,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_cancel_transfer_user',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }
    //////////////////////////////// banner //////////////////////////////////

    async createBanner(idAdmin: string, idBanner: string) {
        try {
            const message = {
                en: 'Create banner successfully',
                vi: 'Tạo mới banner thành công',
            }
            const getAdmin = await this.userSystemModel.findById(idAdmin);
            const getBanner = await this.bannerModel.findById(idBanner);
            const temp = `${getAdmin._id} đã tạo mới banner ${getBanner._id} thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_banner: idBanner,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_create_banner',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);

        }
    }

    async activeBanner(idAdmin: string, idBanner: string) {
        try {
            const message = {
                en: 'Change active banner successfully',
                vi: 'Thay đổi trạng thái banner thành công',
            }
            const getAdmin = await this.userSystemModel.findById(idAdmin);
            const getBanner = await this.bannerModel.findById(idBanner);
            const temp = `${getAdmin._id} đã thay đổi trạng thái của banner ${getBanner._id} thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_banner: idBanner,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_active_banner',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async editBanner(idAdmin: string, idBanner: string) {
        try {
            const message = {
                en: 'Edit banner successfully',
                vi: 'Chỉnh sửa thông tin banner thành công',
            }
            const getAdmin = await this.userSystemModel.findById(idAdmin);
            const getBanner = await this.bannerModel.findById(idBanner);
            const temp = `${getAdmin._id} đã chỉnh sửa thông tin banner ${getBanner._id} thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_banner: idBanner,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_edit_banner',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }
    async deleteBanner(idAdmin: string, idBanner: string) {
        try {
            const message = {
                en: 'Delete banner successfully',
                vi: 'Xóa banner thành công',
            }
            const getAdmin = await this.userSystemModel.findById(idAdmin);
            const getBanner = await this.bannerModel.findById(idBanner);
            const temp = `${getAdmin._id} đã xóa banner ${getBanner._id} thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_banner: idBanner,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_delete_banner',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }


    //////////////////////////////// Business //////////////////////////////////

    async createBusiness(idAdmin: string, idBusiness: string) {
        try {
            const message = {
                en: 'Create business successfully',
                vi: 'Tạo mới đối tác thành công',
            }
            const temp = `${idBusiness} đã tạo mới đối tác ${idBusiness} thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_business: idBusiness,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_create_business',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);

        }
    }

    async activeBusiness(idAdmin: string, idBusiness: string) {
        try {
            const message = {
                en: 'Change active business successfully',
                vi: 'Thay đổi trạng thái đối tác thành công',
            }
            const temp = `${idAdmin} đã thay đổi trạng thái của đối tác ${idBusiness} thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_business: idBusiness,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_acti_business',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async editBusiness(idAdmin: string, idBusiness: string) {
        try {
            const message = {
                en: 'Edit business successfully',
                vi: 'Chỉnh sửa thông tin đối tác thành công',
            }
            const temp = `${idAdmin} đã chỉnh sửa thông tin của đối tác ${idBusiness} thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_business: idBusiness,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_edit_business',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }
    async deleteBusiness(idAdmin: string, idBusiness: string) {
        try {
            const message = {
                en: 'Delete business successfully',
                vi: 'Xóa đối tác thành công',
            }
            const temp = `${idAdmin} đã xóa đối tác ${idBusiness} thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_business: idBusiness,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_delete_business',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }//////////////////////////// business //////////////////////////////////////////

    //////////////////////////// customer //////////////////////////////////////////
    async createCustomer(idAdmin: string, idCustomer: string, pay_point: number) {
        try {
            const message = {
                en: 'Create customer successfully',
                vi: 'Tạo mới khách hàng thành công',
            };
            const getCustomer = await this.customerRepositoryService.findOneById(idCustomer);
            const getAdmin = await this.userSystemModel.findById(idAdmin);
            const temp = `${getAdmin._id} đã tạo mới khách hàng ${getCustomer._id}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_customer: idCustomer,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_create_user',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            if (pay_point > 0) {
                const title = {
                    en: "congratulations give a money",
                    vi: "Tặng tiền thành công cho khách hàng"
                }
                const titleAdmin = `Khách hàng ${idCustomer} Đã được tặng ${pay_point} VND`
                const newGivePayPoint = new this.historyActivityModel({
                    id_customer: idCustomer.toString(),
                    type: "system_give_pay_point_customer",
                    title: title,
                    title_admin: titleAdmin,
                    body: title,
                    date_create: new Date(Date.now()).toISOString(),
                    value: pay_point,
                    current_pay_point: getCustomer.pay_point,
                    status_current_pay_point: "up"
                });
                await newGivePayPoint.save();

                const titleNotification = {
                    en: `Congratulation!!! You have given ${pay_point} VND`,
                    vi: `Bạn đã được tặng ${pay_point} VND`
                }

                const description = {
                    en: `Congratulation!!! You have given ${pay_point} VND for referral code`,
                    vi: `Bạn được tặng ${pay_point} VND khi nhập mã giới thiệu`,
                }

                const payload = {
                    title: titleNotification,
                    description: description,
                    type_notification: 'system',
                    user_object: 'customer',
                    related_id: null,
                    id_customer: idCustomer.toString(),
                }
                await this.notificationSystemService.newActivity(payload);
            }
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async editCustomer(idAdmin: string, idCustomer: string) {
        try {
            const message = {
                en: 'Edit customer',
                vi: 'Thay đổi thông tin khách hàng',
            };
            const getCustomer = await this.customerRepositoryService.findOneById(idCustomer);
            const getAdmin = await this.userSystemModel.findById(idAdmin);
            const temp = `${getAdmin._id} đã thay đổi thông tin khách hàng ${getCustomer._id}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_customer: idCustomer,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_edit_user',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async activeCustomer(idAdmin: string, idCustomer: string) {
        try {
            const message = {
                en: 'Change active customer',
                vi: 'Thay đổi trạng thái khách hàng',
            };
            const getCustomer = await this.customerRepositoryService.findOneById(idCustomer);
            const getAdmin = await this.userSystemModel.findById(idAdmin);
            const temp = `${getAdmin._id} đã thay đổi trạng thái khách hàng ${getCustomer._id}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_customer: idCustomer,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_acti_user',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async deleteCustomer(idAdmin: string, idCustomer: string) {
        try {
            const message = {
                en: 'Deteled customer',
                vi: `Đã xóa khách hàng thành công`,
            };
            const getCustomer = await this.customerRepositoryService.findOneById(idCustomer);
            const getAdmin = await this.userSystemModel.findById(idAdmin);
            const temp = `${getAdmin._id} đã xóa khách hàng ${getCustomer._id}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_customer: idCustomer,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_delete_user',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async lockCustomer(idAdmin: string, idCustomer: string, is_lock_time: boolean) {
        try {
            const message = {
                en: `${is_lock_time ? 'Locked' : 'Unlocked'} customer`,
                vi: `Đã ${is_lock_time ? 'khóa' : 'mở khóa'} khách hàng thành công`,
            };

            const getCustomer = await this.customerRepositoryService.findOneById(idCustomer);
            const getAdmin = await this.userSystemModel.findById(idAdmin);
            const temp = `${getAdmin._id} đã ${is_lock_time ? 'khóa' : 'mở khóa'} khách hàng ${getCustomer._id}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_customer: idCustomer,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_lock_user',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async topUpCustomer(admin: UserSystemDocument, customer: CustomerDocument, transfer: TransactionDocument) {
        try {

            const message = {
                en: 'Create top up customer successfully',
                vi: 'Tạo lệnh nạp tiền cho khách hàng thành công',
            };
            const temp = `${admin._id} đã tạo lệnh nạp ${transfer._id} cho khách hàng ${customer._id}`;
            const newItem = await this.historyActivitySystemService.createItem({
                id_admin_action: admin._id,
                id_customer: customer._id,
                id_transaction: transfer._id,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_top_up_user',
                date_create: new Date(Date.now()).toISOString(),
                value: transfer.money
            })
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async withdrawCustomer(admin: UserSystemDocument, customer: CustomerDocument, transfer: TransactionDocument) {
        try {
            const message = {
                en: 'Create withdraw customer successfully',
                vi: 'Tạo lệnh rút tiền khách hàng thành công',
            };
            const temp = `${admin._id} đã tạo lệnh rút ${transfer._id} của khách hàng ${customer._id}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: admin._id,
                id_customer: customer._id,
                id_transaction: transfer._id,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_withdraw_user',
                date_create: new Date(Date.now()).toISOString(),
                value: transfer.money,
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async punishCustomer(admin: UserSystemDocument, customer: CustomerDocument, transfer: TransactionDocument) {
        try {
            const message = {
                en: 'Create punish customer successfully',
                vi: 'Tạo lệnh phạt khách hàng thành công',
            };
            const temp = `${admin._id} đã tạo lệnh phạt ${transfer._id} cho khách hàng ${customer._id}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: admin._id,
                id_customer: customer._id,
                id_transaction: transfer._id,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_punish_user',
                date_create: new Date(Date.now()).toISOString(),
                value: transfer.money,
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async createTicketIncome(admin: UserSystemDocument, transfer: TransactionDocument) {
        try {
            const message = {
                en: 'Create ticket income successfully',
                vi: 'Tạo phiếu thu thành công',
            };
            const temp = `${admin._id} đã tạo phiếu thu ${transfer._id} thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: admin._id,
                id_transaction: transfer._id,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_create_ticket_income',
                date_create: new Date(Date.now()).toISOString(),
                value: transfer.money,
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async createTicketExpense(admin: UserSystemDocument, transfer: TransactionDocument) {
        try {
            const message = {
                en: 'Create ticket expense successfully',
                vi: 'Tạo phiếu chi thành công',
            };
            const temp = `${admin._id} đã tạo phiếu chi ${transfer._id} thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: admin._id,
                id_transaction: transfer._id,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_create_ticket_expense',
                date_create: new Date(Date.now()).toISOString(),
                value: transfer.money,
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async deleteTransCustomer(idAdmin: string, idCustomer, transfer,) {
        try {
            const message = {
                en: 'Delete transfer of customer',
                vi: 'Đã hủy lệnh chuyển khoản của khách hàng',
            };
            const getCustomer = await this.customerRepositoryService.findOneById(idCustomer);
            const getAdmin = await this.userSystemModel.findById(idAdmin);
            const temp = `${getAdmin._id} đã hủy lệnh ${transfer._id} của khách hàng ${getCustomer._id}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_customer: idCustomer,
                id_transistion_customer: transfer._id,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_delete_transfer_user',
                date_create: new Date(Date.now()).toISOString(),
                value: transfer.money
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async verifyTopUpCustomer(admin: UserSystemDocument, customer: CustomerDocument, transaction: TransactionDocument) {
        try {
            const message = {
                en: 'Verified top up successfully',
                vi: 'Đã duyệt lệnh nạp thành công',
            };
            const _money = this.generalHandleService.formatMoney(transaction.money)
            const temp = `${admin._id} đã duyệt lệnh ${transaction.id_view} của khách hàng ${customer._id} thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: admin._id,
                id_customer: customer._id,
                id_transaction: transaction._id,
                title: message,
                body: message,
                title_admin: temp,
                type: 'verify_top_up',
                current_pay_point: customer.pay_point,
                status_current_pay_point: "up",
                date_create: new Date(Date.now()).toISOString(),
                value: transaction.money
            })

            const title = {
                vi: `Nạp ${_money} vào tài khoản thành công !!!`,
                en: `Top up ${_money} successfully!!!`
            }
            const payload = {
                title: title,
                description: title,
                id_customer: customer._id,
                type_notification: 'activity',
            }
            await this.notificationSystemService.newActivity(payload)
            const getAllDeviceToken = await this.deviceTokenModel.find({ user_id: customer._id });
            const arrDeviceToken = [];
            for (const item of getAllDeviceToken) {
                arrDeviceToken.push(item.token);
            }
            const payloadNoti = {
                title: "Nạp tiền vào tài khoản thành công !!!",
                body: `Tài khoản của bạn đã nạp ${_money} VND thành công !!!`,
                token: arrDeviceToken
            }
            if (arrDeviceToken.length > 0) {
                this.notificationService.send(payloadNoti)
            }
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async verifyRefundTransCustomer(idAdmin: string, idCustomer, transfer, previousBalance) {
        try {
            const message = {
                en: 'Verified refund successfully',
                vi: 'Đã duyệt lệnh hoàn tiền thành công',
            };
            const getCustomer = await this.customerRepositoryService.findOneById(idCustomer);
            const getAdmin = await this.userSystemModel.findById(idAdmin);
            const getAllDeviceToken = await this.deviceTokenModel.find({ user_id: getCustomer._id });
            const arrDeviceToken = [];
            for (const item of getAllDeviceToken) {
                arrDeviceToken.push(item.token);
            }
            const temp = `${getAdmin._id} đã duyệt lệnh ${transfer.id_view} của khách hàng ${getCustomer._id} thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_customer: idCustomer,
                id_transistion_customer: transfer._id,
                title: message,
                body: message,
                title_admin: temp,
                type: 'verify_refund',
                current_pay_point: getCustomer.pay_point,
                status_current_pay_point: (previousBalance.pay_point < getCustomer.pay_point) ?
                    "up" : (previousBalance.pay_point > getCustomer.pay_point) ? "down" : "none",
                date_create: new Date(Date.now()).toISOString(),
                value: transfer.money
            })
            const payloadNoti = {
                title: "Hoàn tiền vào tài khoản thành công !!!",
                body: `Tài khoản của bạn đã được hoàn ${Number(transfer.money)} VND thành công !!!`,
                token: arrDeviceToken
            }
            const title = {
                vi: `Hoàn ${transfer.money} VND vào tài khoản thành công !!!`,
                en: `Refund ${transfer.money} VND successfully!!!`
            }
            const payload = {
                title: title,
                description: title,
                id_customer: getCustomer._id,
                type_notification: 'activity',
                id_transistion_customer: transfer._id
            }
            await this.notificationSystemService.newActivity(payload)
            if (arrDeviceToken.length > 0) {
                this.notificationService.send(payloadNoti)
            }

            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async verifyRewardTransCustomer(idAdmin: string, idCustomer, transfer, previousBalance) {
        try {
            const message = {
                en: 'Verified reward successfully',
                vi: 'Đã duyệt lệnh tặng  thành công',
            };
            const getCustomer = await this.customerRepositoryService.findOneById(idCustomer);
            const getAdmin = await this.userSystemModel.findById(idAdmin);
            const getAllDeviceToken = await this.deviceTokenModel.find({ user_id: getCustomer._id });
            const arrDeviceToken = [];
            for (const item of getAllDeviceToken) {
                arrDeviceToken.push(item.token);
            }
            const temp = `${getAdmin._id} đã duyệt lệnh ${transfer.id_view} của khách hàng ${getCustomer._id} thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_customer: idCustomer,
                id_transistion_customer: transfer._id,
                title: message,
                body: message,
                title_admin: temp,
                type: 'verify_reward',
                current_pay_point: getCustomer.pay_point,
                status_current_pay_point: (previousBalance.pay_point < getCustomer.pay_point) ?
                    "up" : (previousBalance.pay_point > getCustomer.pay_point) ? "down" : "none",
                date_create: new Date(Date.now()).toISOString(),
                value: transfer.money
            })
            const payloadNoti = {
                title: "Thưởng tiền vào tài khoản thành công !!!",
                body: `Tài khoản của bạn đã được thưởng ${Number(transfer.money)} VND thành công !!!`,
                token: arrDeviceToken
            }
            const title = {
                vi: `Thưởng ${transfer.money} VND vào tài khoản thành công !!!`,
                en: `Reward ${transfer.money} VND successfully!!!`
            }
            const payload = {
                title: title,
                description: title,
                id_customer: getCustomer._id,
                type_notification: 'activity',
                id_transistion_customer: transfer._id
            }
            await this.notificationSystemService.newActivity(payload)
            if (arrDeviceToken.length > 0) {
                this.notificationService.send(payloadNoti)
            }

            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async verifyWithdrawTransCustomer(admin: UserSystemDocument, customer: CustomerDocument, transaction: TransactionDocument) {
        try {
            const message = {
                en: 'Verified withdraw successfully',
                vi: 'Đã duyệt lệnh rút thành công',
            };
            const temp = `${admin._id} đã duyệt lệnh ${transaction.id_view} của khách hàng ${customer._id} thành công`;
            const _money = this.generalHandleService.formatMoney(transaction.money)
            const getAllDeviceToken = await this.deviceTokenModel.find({ user_id: customer._id });
            const arrDeviceToken = [];
            for (const item of getAllDeviceToken) {
                arrDeviceToken.push(item.token);
            }
            const newItem = new this.historyActivityModel({
                id_admin_action: admin._id,
                id_customer: customer._id,
                id_transaction_customer: transaction._id,
                title: message,
                body: message,
                title_admin: temp,
                type: 'verify_withdraw',
                current_pay_point: customer.pay_point,
                status_current_pay_point: "down",
                date_create: new Date(Date.now()).toISOString(),
                value: transaction.money
            })
            await newItem.save();
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

    async verifyPunishTransCustomer(admin: UserSystemDocument, customer: CustomerDocument, transaction: TransactionDocument) {
        try {
            const message = {
                en: 'Verified punish successfully',
                vi: 'Đã duyệt lệnh phạt thành công',
            };
            const temp = `${admin._id} đã duyệt lệnh ${transaction.id_view} của khách hàng ${customer._id} thành công`;
            const getAllDeviceToken = await this.deviceTokenModel.find({ user_id: customer._id });
            const arrDeviceToken = [];
            for (const item of getAllDeviceToken) {
                arrDeviceToken.push(item.token);
            }
            const newItem = {
                id_admin_action: admin._id,
                id_customer: customer._id,
                id_transactionr: transaction._id,
                title: message,
                body: message,
                title_admin: temp,
                type: 'verify_punish',
                current_pay_point: customer.pay_point,
                status_current_pay_point: "down",
                date_create: new Date(Date.now()).toISOString(),
                value: transaction.money
            }
            await this.historyActivityRepositoryService.create(newItem)
            // await newItem.save();
            const formatMoney = this.generalHandleService.formatMoney(transaction.money)
            const payloadNoti = {
                title: "Phạt tiền tài khoản !!!",
                body: `Tài khoản của bạn đã bị phạt ${formatMoney}!!!`,
                token: arrDeviceToken
            }
            const titleNotification = {
                en: `You are punished ${formatMoney}`,
                vi: `Bạn đã bị phạt ${formatMoney} thành công`
            }

            const description = {
                en: `You are punished ${formatMoney}`,
                vi: `Bạn đã bị phạt ${formatMoney} thành công`
            }
            const payload = {
                title: titleNotification,
                description: description,
                id_customer: customer._id,
                type_notification: 'activity',
                id_transaction: transaction._id
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

    async verifyPayServiceTransCustomer(idAdmin: string, idCustomer, transfer, previousBalance) {
        try {
            const message = {
                en: 'Verified pay service successfully',
                vi: 'Đã duyệt lệnh thanh toán dịch vụ thành công',
            };
            const getCustomer = await this.customerRepositoryService.findOneById(idCustomer);
            const getAdmin = await this.userSystemModel.findById(idAdmin);
            const temp = `${getAdmin._id} đã duyệt lệnh ${transfer.id_view} của khách hàng ${getCustomer._id} thành công`;
            const getAllDeviceToken = await this.deviceTokenModel.find({ user_id: getCustomer._id });
            const arrDeviceToken = [];
            for (const item of getAllDeviceToken) {
                arrDeviceToken.push(item.token);
            }
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_customer: getCustomer._id,
                id_transistion_customer: transfer._id,
                title: message,
                body: message,
                title_admin: temp,
                type: 'verify_pay_service',
                current_pay_point: getCustomer.pay_point,
                status_current_pay_point: (previousBalance.pay_point < getCustomer.pay_point) ?
                    "up" : (previousBalance.pay_point > getCustomer.pay_point) ? "down" : "none",
                date_create: new Date(Date.now()).toISOString(),
                value: transfer.money
            })
            await newItem.save();
            const payloadNoti = {
                title: "Thanh toán dịch vụ thành công !!!",
                body: `Bạn đã thanh toán ${Number(transfer.money)} VND thành công!!!`,
                token: arrDeviceToken
            }
            const titleNotification = {
                en: `You pay ${transfer.money} VND for service successful!!!`,
                vi: `Bạn đã thanh toán ${transfer.money} VND thành công`
            }

            const description = {
                en: `You pay ${transfer.money} VND for service successful!!!`,
                vi: `Bạn đã thanh toán ${transfer.money} VND thành công`
            }
            const payload = {
                title: titleNotification,
                description: description,
                id_customer: getCustomer._id,
                type_notification: 'activity',
                id_transistion_customer: transfer._id
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

    async editTransCustomer(idAdmin: string, idCustomer, transfer) {
        try {
            const message = {
                en: 'Edit top up successfully',
                vi: 'Đã thay đổi lệnh nạp thành công',
            };
            const getCustomer = await this.customerRepositoryService.findOneById(idCustomer);
            const getAdmin = await this.userSystemModel.findById(idAdmin);
            const temp = `${getAdmin._id} đã thay đổi lệnh ${transfer._id} của khách hàng ${getCustomer._id}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_customer: idCustomer,
                id_transistion_customer: transfer._id,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_edit_transfer_user',
                date_create: new Date(Date.now()).toISOString(),
                value: transfer.money
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }



    async editPointCustomer(idAdmin: string, idCustomer, point) {
        const message = {
            en: 'Edit point customer successfully',
            vi: 'Đã chỉnh sửa điểm của khách hàng thành công',
        };
        const getCustomer = await this.customerRepositoryService.findOneById(idCustomer);
        const getAdmin = await this.userSystemModel.findById(idAdmin);
        const temp = `${getAdmin._id} đã thay đổi điểm của khách hàng ${getCustomer._id} thành ${point}`;
        const newItem = new this.historyActivityModel({
            id_admin_action: idAdmin,
            id_customer: idCustomer,
            title: message,
            body: message,
            title_admin: temp,
            type: 'admin_edit_point_of_customer',
            date_create: new Date(Date.now()).toISOString(),
            value: point
        })
        await newItem.save();
        return true;
    }

    async editRankPointCustomer(idAdmin: string, idCustomer, rankPoint: number) {
        const message = {
            en: 'Edit rank point customer successfully',
            vi: 'Đã chỉnh sửa điểm hạng của khách hàng thành công',
        };
        const getCustomer = await this.customerRepositoryService.findOneById(idCustomer);
        const getAdmin = await this.userSystemModel.findById(idAdmin);
        const temp = `${getAdmin._id} đã thay đổi điểm hạng của khách hàng ${getCustomer._id} thành ${rankPoint}`;
        const newItem = new this.historyActivityModel({
            id_admin_action: idAdmin,
            id_customer: idCustomer,
            title: message,
            body: message,
            title_admin: temp,
            type: 'admin_edit_rank_point_of_customer',
            date_create: new Date(Date.now()).toISOString(),
            value: rankPoint
        })
        await newItem.save();
        return true;
    }
    ////////////////////////////////////// extend optional //////////////////////////////////////////////////////////////////

    async createExtendOptional(idAdmin: string, idExtend: string) {
        try {
            const message = {
                en: 'Create extend optional successfully',
                vi: 'Tạo mới extend optional thành công',
            };
            // const getCustomer = await this.customerModel.findById(idExtend);
            // const getAdmin = await this.userSystemModel.findById(idAdmin);
            const temp = `${idAdmin} đã tạo mới extend optional ${idExtend}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_extend_optional: idExtend,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_create_extend_optional',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async actiExtendOptional(idAdmin: string, idExtend: string) {
        try {
            const message = {
                en: 'Change active of extend optional',
                vi: 'Đã thay đổi trạng thái của extend optional',
            };
            const getCustomer = await this.customerRepositoryService.findOneById(idExtend);
            const getAdmin = await this.userSystemModel.findById(idAdmin);
            const temp = `${idAdmin} đã thay đổi trạng extend optional ${idExtend}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_extend_optional: idExtend,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_acti_extend_optional',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async editExtendOptional(idAdmin: string, idExtend: string) {
        try {
            const message = {
                en: 'Edited extend optional successfully',
                vi: 'Thay đổi thông tin extend optional thành công',
            };
            // const getCustomer = await this.customerModel.findById(idExtend);
            // const getAdmin = await this.userSystemModel.findById(idAdmin);
            const temp = `${idAdmin} đã thay đổi thông tin extend optional ${idExtend}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_extend_optional: idExtend,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_edit_extend_optional',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async deleteExtendOptional(idAdmin: string, idExtend: string) {
        try {
            const message = {
                en: 'Deleted extend optional successfully',
                vi: 'Xóa extend optional thành công',
            };
            // const getCustomer = await this.customerModel.findById(idExtend);
            // const getAdmin = await this.userSystemModel.findById(idAdmin);
            const temp = `${idAdmin} đã xóa extend optional ${idExtend}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_extend_optional: idExtend,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_delete_extend_optional',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    ////////////////////////////////////// feed back //////////////////////////////////////////////////////////////////

    async createFeedBack(idAdmin: string, idFeedBack: string) {
        try {
            const message = {
                en: 'Create feedback successfully',
                vi: 'Tạo mới phản hồi thành công',
            };
            // const getCustomer = await this.customerModel.findById(idExtend);
            // const getAdmin = await this.userSystemModel.findById(idAdmin);
            const temp = `${idAdmin} đã tạo mới phản hồi ${idFeedBack} thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_feed_back: idFeedBack,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_create_feed_back',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async editFeedBack(idAdmin: string, idFeedBack: string) {
        try {
            const message = {
                en: 'Edited feedback',
                vi: 'Đã chỉnh sửa phản hồi',
            };
            // const getCustomer = await this.customerModel.findById(idExtend);
            // const getAdmin = await this.userSystemModel.findById(idAdmin);
            const temp = `${idAdmin} đã chỉnh phản hồi ${idFeedBack}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_feed_back: idFeedBack,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_edit_feed_back',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async deleteFeedBack(idAdmin: string, idFeedBack: string) {
        try {
            const message = {
                en: 'Deleted feedback successfully',
                vi: 'Đã xóa phản hồi thành công',
            };
            const temp = `${idAdmin} đã xóa phản hồi ${idFeedBack}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_feed_back: idFeedBack,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_delete_feed_back',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async processedFeedBack(idAdmin: string, idFeedBack: string) {
        try {
            const message = {
                en: 'Processed feedback',
                vi: 'Đã xử lý phản hồi',
            };
            // const getCustomer = await this.customerModel.findById(idExtend);
            // const getAdmin = await this.userSystemModel.findById(idAdmin);
            const temp = `${idAdmin} đã xử lý phản hồi ${idFeedBack}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_feed_back: idFeedBack,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_processed_feed_back',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async changeStatusFeedback(idAdmin: string, idFeedBack: string) {
        try {
            const message = {
                en: 'Change status feedback',
                vi: 'Đã thay đổi trạng thái phản hồi',
            };
            // const getCustomer = await this.customerModel.findById(idExtend);
            // const getAdmin = await this.userSystemModel.findById(idAdmin);
            const temp = `${idAdmin} thay đổi trạng thái của phản hồi ${idFeedBack}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_feed_back: idFeedBack,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_change_status_feedback',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    ////////////////////////////////////// group customer //////////////////////////////////////////////////////////////////

    async createGroupCustomer(idAdmin: string, idGroupCustomer: string) {
        try {
            const message = {
                en: 'Create group customer successfully',
                vi: 'Tạo mới nhóm khách hàng thành công',
            };
            const temp = `${idAdmin} đã tạo mới nhóm khách hàng ${idGroupCustomer} thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_group_customer: idGroupCustomer,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_create_group_customer',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async editGroupCustomer(idAdmin: string, idGroupCustomer: string) {
        try {
            const message = {
                en: 'Edited group customer',
                vi: 'Đã chỉnh sửa thông tin nhóm khách hàng',
            };
            const temp = `${idAdmin} đã chỉnh sửa thông tin nhóm khách hàng ${idGroupCustomer}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_group_customer: idGroupCustomer,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_edit_group_customer',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async deleteGroupCustomer(idAdmin: string, idGroupCustomer: string) {
        try {
            const message = {
                en: 'Deleted group customer successfully',
                vi: 'Đã xóa nhóm khách hàng thành công',
            };
            const temp = `${idAdmin} đã xóa nhóm khách hàng ${idGroupCustomer}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_group_customer: idGroupCustomer,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_delete_group_customer',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async actiGroupCustomer(idAdmin: string, idGroupCustomer: string) {
        try {
            const message = {
                en: 'Active group customer successfully',
                vi: 'Đã thay đổi trạng thái nhóm khách hàng thành công',
            };
            const temp = `${idAdmin} đã thay đổi trạng thái nhóm khách hàng ${idGroupCustomer}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_group_customer: idGroupCustomer,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_acti_group_customer',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    ////////////////////////////////////// end group customer //////////////////////////////////////////////////////////////////
    ////////////////////////////////////// group promotion //////////////////////////////////////////////////////////////////

    async createGroupPromotion(idAdmin: string, idGroupPromotion: string) {
        try {
            const message = {
                en: 'Create group customer successfully',
                vi: 'Tạo mới nhóm khuyến mãi thành công',
            };
            const temp = `${idAdmin} đã tạo mới nhóm khuyến mãi ${idGroupPromotion} thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_group_promotion: idGroupPromotion,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_create_group_promotion',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async editGroupPromotion(idAdmin: string, idGroupPromotion: string) {
        try {
            const message = {
                en: 'Edited group customer',
                vi: 'Đã chỉnh sửa thông tin nhóm khuyến mãi',
            };
            const temp = `${idAdmin} đã chỉnh sửa thông tin nhóm khuyến mãi ${idGroupPromotion}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_group_promotion: idGroupPromotion,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_edit_group_promotion',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async deleteGroupPromotion(idAdmin: string, idGroupPromotion: string) {
        try {
            const message = {
                en: 'Deleted group customer successfully',
                vi: 'Đã xóa nhóm khuyến mãi thành công',
            };
            const temp = `${idAdmin} đã xóa nhóm khuyến mãi ${idGroupPromotion}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_group_promotion: idGroupPromotion,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_delete_group_promotion',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async actiGroupPromotion(idAdmin: string, idGroupPromotion: string) {
        try {
            const message = {
                en: 'Active group customer successfully',
                vi: 'Đã thay đổi trạng thái nhóm khuyến mãi thành công',
            };
            const temp = `${idAdmin} đã thay đổi trạng thái nhóm khuyến mãi ${idGroupPromotion}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_group_promotion: idGroupPromotion,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_acti_group_promotion',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    ////////////////////////////////////// end group promotion //////////////////////////////////////////////////////////////////
    ////////////////////////////////////// group service //////////////////////////////////////////////////////////////////

    async createGroupService(idAdmin: string, idGroupService: string) {
        try {
            const message = {
                en: 'Create group service successfully',
                vi: 'Tạo mới nhóm dịch vụ thành công',
            };
            const temp = `${idAdmin} đã tạo mới nhóm dịch vụ ${idGroupService} thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_group_service: idGroupService,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_create_group_service',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async actiGroupService(idAdmin: string, idGroupService: string) {
        try {
            const message = {
                en: 'Change active of group service',
                vi: 'Đã thay đổi trạng thái của nhóm dịch vụ',
            };
            const temp = `${idAdmin} đã thay đổi trạng của nhóm dịch vụ ${idGroupService}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_group_service: idGroupService,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_acti_group_service',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async editGroupService(idAdmin: string, idGroupService: string) {
        try {
            const message = {
                en: 'Edited group service successfully',
                vi: 'Thay đổi thông tin nhóm dịch thành công',
            };
            const temp = `${idAdmin} đã thay đổi thông tin nhóm dịch vụ ${idGroupService}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_group_service: idGroupService,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_edit_group_service',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async deleteGroupService(idAdmin: string, idGroupService: string) {
        try {
            const message = {
                en: 'Deleted group service successfully',
                vi: 'Xóa nhóm dịch vụ thành công',
            };
            const temp = `${idAdmin} đã xóa nhóm dịch vụ ${idGroupService} thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_group_service: idGroupService,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_delete_group_service',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    ////////////////////////////////////// news //////////////////////////////////////////////////////////////////

    async createNews(idAdmin: string, idNews: string) {
        try {
            const message = {
                en: 'Create news successfully',
                vi: 'Tạo mới tin tức thành công',
            };
            const temp = `${idAdmin} đã tạo tin tức ${idNews} thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_news: idNews,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_create_news',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async actiNews(idAdmin: string, idNews: string) {
        try {
            const message = {
                en: 'Change active of news',
                vi: 'Đã thay đổi trạng thái của tin tức',
            };
            const temp = `${idAdmin} đã thay đổi trạng của tin ${idNews}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_news: idNews,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_acti_news',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async editNews(idAdmin: string, idNews: string) {
        try {
            const message = {
                en: 'Edited group service successfully',
                vi: 'Thay đổi thông tin tin tức thành công',
            };
            const temp = `${idAdmin} đã thay đổi thông tin tin tức ${idNews}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_news: idNews,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_edit_news',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async deleteNews(idAdmin: string, idNews: string) {
        try {
            const message = {
                en: 'Deleted news successfully',
                vi: 'Xóa tin tức thành công',
            };
            const temp = `${idAdmin} đã xóa tin tức ${idNews} thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_news: idNews,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_delete_news',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    ////////////////////////////////////// optional service //////////////////////////////////////////////////////////////////

    async createOptionalService(idAdmin: string, idOptionalService: string) {
        try {
            const message = {
                en: 'Create new optional service successfully',
                vi: 'Tạo mới optional service thành công',
            };
            const temp = `${idAdmin} đã tạo optional service ${idOptionalService} thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_optional_service: idOptionalService,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_create_optional_service',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async actiOptionalService(idAdmin: string, idOptionalService: string) {
        try {
            const message = {
                en: 'Change active of optional service ',
                vi: 'Đã thay đổi trạng thái của optional service ',
            };
            const temp = `${idAdmin} đã thay đổi trạng của optional service ${idOptionalService}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_optional_service: idOptionalService,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_acti_optional_service',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async editOptionalService(idAdmin: string, idOptionalService: string) {
        try {
            const message = {
                en: 'Edited optional service successfully',
                vi: 'Thay đổi thông tin optional service thành công',
            };
            const temp = `${idAdmin} đã thay đổi thông tin optional service ${idOptionalService}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_optional_service: idOptionalService,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_edit_optional_service',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async deleteOptionalService(idAdmin: string, idOptionalService: string) {
        try {
            const message = {
                en: 'Deleted optional service  successfully',
                vi: 'Xóa optional service thành công',
            };
            const temp = `${idAdmin} đã xóa optional service  ${idOptionalService} thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_optional_service: idOptionalService,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_delete_optional_service',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    ////////////////////////////////////// promotion //////////////////////////////////////////////////////////////////

    async createPromotion(idAdmin: string, idPromotion: string) {
        try {
            const message = {
                en: 'Create new promotion successfully',
                vi: 'Tạo mới khuyến mãi thành công',
            };
            const temp = `${idAdmin} đã tạo khuyến mãi ${idPromotion} thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_promotion: idPromotion,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_create_promotion',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async actiPromotion(idAdmin: string, idPromotion: string) {
        try {
            const message = {
                en: 'Change active of promotion ',
                vi: 'Đã thay đổi trạng thái của khuyến mãi ',
            };
            const temp = `${idAdmin} đã thay đổi trạng của khuyến mãi ${idPromotion}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_promotion: idPromotion,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_acti_promotion',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async editPromotion(idAdmin: string, idPromotion: string) {
        try {
            const message = {
                en: 'Edited promotion successfully',
                vi: 'Thay đổi thông tin khuyến mãi thành công',
            };
            const temp = `${idAdmin} đã thay đổi thông tin khuyến mãi ${idPromotion}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_promotion: idPromotion,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_edit_promotion',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async deletePromotion(idAdmin: string, idPromotion: string) {
        try {
            const message = {
                en: 'Deleted promotion successfully',
                vi: 'Xóa khuyến mãi thành công',
            };
            const temp = `${idAdmin} đã xóa khuyến mãi ${idPromotion} thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_promotion: idPromotion,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_delete_promotion',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    ////////////////////////////////////// push notification //////////////////////////////////////////////////////////////////

    async createPushNotification(idAdmin: string, idPushNotification: string) {
        try {
            const message = {
                en: 'Create new schedule push notification successfully',
                vi: 'Tạo mới lịch bắn thông báo thành công',
            };
            const temp = `${idAdmin} đã tạo mới lịch bắn thông báo ${idPushNotification} thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_push_notification: idPushNotification,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_create_push_notification',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async actiPushNotification(idAdmin: string, idPushNotification: string) {
        try {
            const message = {
                en: 'Change active of promotion ',
                vi: 'Đã thay đổi trạng thái của thông báo ',
            };
            const temp = `${idAdmin} đã thay đổi trạng thái của thông báo ${idPushNotification}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_push_notification: idPushNotification,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_acti_push_notification',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async editPushNotification(idAdmin: string, idPushNotification: string) {
        try {
            const message = {
                en: 'Edited promotion successfully',
                vi: 'Thay đổi thông tin của thông báo thành công',
            };
            const temp = `${idAdmin} đã thay đổi thông tin thông báo ${idPushNotification}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_push_notification: idPushNotification,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_edit_push_notification',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async deletePushNotification(idAdmin: string, idPushNotification: string) {
        try {
            const message = {
                en: 'Deleted push notification successfully',
                vi: 'Xóa thông báo thành công',
            };
            const temp = `${idAdmin} đã xóa thông báo ${idPushNotification} thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_push_notification: idPushNotification,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_delete_push_notification',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    ////////////////////////////////////// reason cancel //////////////////////////////////////////////////////////////////

    async createReasonCancel(idAdmin: string, idReasonCancel: string) {
        try {
            const message = {
                en: 'Create new reason cancel successfully',
                vi: 'Tạo mới lý do hủy việc thành công',
            };
            const temp = `${idAdmin} đã tạo mới lý do hủy việc ${idReasonCancel} thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_reason_cancel: idReasonCancel,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_create_reason_cancel',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async actiReasonCancel(idAdmin: string, idReasonCancel: string) {
        try {
            const message = {
                en: 'Change active of reason cancel ',
                vi: 'Đã thay đổi trạng thái của lý do hủy việc ',
            };
            const temp = `${idAdmin} đã thay đổi trạng thái của lý do hủy việc ${idReasonCancel}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_reason_cancel: idReasonCancel,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_acti_reason_cancel',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async editReasonCancel(idAdmin: string, idReasonCancel: string) {
        try {
            const message = {
                en: 'Edited reason cancel successfully',
                vi: 'Thay đổi thông tin lý do hủy việc thành công',
            };
            const temp = `${idAdmin} đã thay đổi thông tin lý do hủy việc ${idReasonCancel}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_reason_cancel: idReasonCancel,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_edit_reason_cancel',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async deleteReasonCancel(idAdmin: string, idReasonCancel: string) {
        try {
            const message = {
                en: 'Deleted reason cancel successfully',
                vi: 'Xóa lý do hủy việc thành công',
            };
            const temp = `${idAdmin} đã xóa lý do hủy việc ${idReasonCancel} thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_reason_cancel: idReasonCancel,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_delete_reason_cancel',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }
    ////////////////////////////////////// reason punish //////////////////////////////////////////////////////////////////

    async createReasonPunish(idAdmin: string, idReasonPunish: string) {
        try {
            const message = {
                en: 'Create new reason punish successfully',
                vi: 'Tạo mới lý do phạt thành công',
            };
            const temp = `${idAdmin} đã tạo mới lý do phạt ${idReasonPunish} thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_reason_punish: idReasonPunish,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_create_reason_punish',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async editReasonPunish(idAdmin: string, idReasonPunish: string) {
        try {
            const message = {
                en: 'Edited reason punish successfully',
                vi: 'Thay đổi thông tin lý do phạt thành công',
            };
            const temp = `${idAdmin} đã thay đổi thông tin lý do phạt ${idReasonPunish}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_reason_punish: idReasonPunish,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_edit_reason_punish',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async actiReasonPunish(idAdmin: string, idReasonPunish: string) {
        try {
            const message = {
                en: 'Change active of reason punish ',
                vi: 'Đã thay đổi trạng thái của lý do phạt ',
            };
            const temp = `${idAdmin} đã thay đổi trạng thái của lý do phạt ${idReasonPunish}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_reason_punish: idReasonPunish,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_acti_reason_punish',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async deleteReasonPunish(idAdmin: string, idReasonPunish: string) {
        try {
            const message = {
                en: 'Deleted reason punish successfully',
                vi: 'Xóa lý do phạt thành công',
            };
            const temp = `${idAdmin} đã xóa lý do phạt ${idReasonPunish} thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_reason_punish: idReasonPunish,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_delete_reason_punish',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    ////////////////////////////////////// service //////////////////////////////////////////////////////////////////

    async createService(idAdmin: string, idService: string) {
        try {
            const message = {
                en: 'Create new service successfully',
                vi: 'Tạo mới dịch vụ thành công',
            };
            const temp = `${idAdmin} đã tạo mới dịch vụ ${idService} thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_service: idService,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_create_service',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async actiService(idAdmin: string, idService: string) {
        try {
            const message = {
                en: 'Change active of service',
                vi: 'Đã thay đổi trạng thái của dịch vụ ',
            };
            const temp = `${idAdmin} đã thay đổi trạng thái của dịch vụ ${idService}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_service: idService,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_acti_service',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async editService(idAdmin: string, idService: string) {
        try {
            const message = {
                en: 'Edited service successfully',
                vi: 'Thay đổi thông tin của dịch vụ thành công',
            };
            const temp = `${idAdmin} đã thay đổi thông tin dịch vụ ${idService}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_service: idService,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_edit_service',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async deleteService(idAdmin: string, idService: string) {
        try {
            const message = {
                en: 'Deleted service successfully',
                vi: 'Xóa dịch vụ thành công',
            };
            const temp = `${idAdmin} đã xóa dịch vụ ${idService} thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_service: idService,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_delete_service',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    ///////////////////////////////// create admin //////////////////////////////////////////

    async createAdmin(idAdmin: string, id: string) {
        try {
            const message = {
                en: 'Create new usersystem successfully',
                vi: 'Tạo mới usersystem thành công',
            };
            const temp = `${idAdmin} đã tạo mới usersystem ${id} thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_user_system: id,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_create_user_system',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async editAdmin(idAdmin: string, id: string) {
        try {
            const message = {
                en: 'Edit usersystem successfully',
                vi: 'Chỉnh sửa thông tin usersystem thành công',
            };
            const temp = `${idAdmin} đã chỉnh sửa thông tin usersystem ${id} thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_user_system: id,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_edit_user_system',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async actiAdmin(idAdmin: string, id: string) {
        try {
            const message = {
                en: 'Active usersystem successfully',
                vi: 'Đã thay đổi trạng thái của usersystem thành công',
            };
            const temp = `${idAdmin} đã thay đổi trạng thái của usersystem ${id} thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_user_system: id,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_acti_user_system',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async deleteAdmin(idAdmin: string, id: string) {
        try {
            const message = {
                en: 'Delete usersystem successfully',
                vi: 'Đã usersystem thành công',
            };
            const temp = `${idAdmin} đã xóa usersystem ${id} thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_user_system: id,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_delete_user_system',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }
    ///////////////////////////////// admin add collaborator join to order //////////////////////////////////
    async adminAddCollaboratorToOrder(idAdmin: string, idOrder: string, idCollaborator, idGroupOrder) {
        try {
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(idCollaborator);
            const getOrder = await this.orderModel.findById(idOrder);
            const getCustomer = await this.customerRepositoryService.findOneById(getOrder.id_customer.toString());
            const temp = {
                en: "Admin add collaborator confirmed this job",
                vi: "Admin thêm CTV vào công việc"
            }
            const temp2 = `${idAdmin} đã thêm CTV ${getCollaborator._id} vào công việc ${idOrder}`
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_collaborator: idCollaborator,
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "admin_add_collaborator_to_order",
                date_create: new Date(Date.now()).toISOString(),
                id_order: getOrder._id,
                id_group_order: idGroupOrder
            })
            await newItem.save();
            const title = {
                vi: `Bạn được giao công việc thành công`,
                en: `You have been successfully assigned to the job`
            }
            const description = {
                vi: `Chúc mừng bạn đã nhận được việc thành công `,
                en: `Congratulation!! You had took the job successfully`
            }
            const payloadNotification = {
                title: title,
                description: description,
                user_object: "collaborator",
                id_collaborator: idCollaborator,
                type_notification: "activity",
                related_id: idOrder,
                id_order: idOrder,
                id_group_order: idGroupOrder
            }
            this.notificationSystemService.newActivity(payloadNotification);
            const title2 = {
                vi: `${getCollaborator.full_name} xác nhận đơn ${getOrder.id_view}`,
                en: `${getCollaborator.full_name} confirmed order ${getOrder.id_view}`
            }
            const des2 = {
                vi: `${getCollaborator.full_name} đã nhận việc. Vui lòng giữ điện thoại ở chế độ liên lạc và sẵn sàng mô tả thêm về công việc khi "Cộng tác viên" đến nơi.`,
                en: `${getCollaborator.full_name} accepted the job. Please keep your phone in communication mode and be ready to describe the work further when the "Collaborator" arrives.`
            }

            const payloadNotiCustomer = {
                title: title2,
                description: des2,
                user_object: "customer",
                id_customer: getCustomer._id,
                type_notification: "activity",
                related_id: idOrder,
                id_order: idOrder,
                id_group_order: idGroupOrder
            }
            this.notificationSystemService.newActivity(payloadNotiCustomer);
            const arrDeviceToken = await this.deviceTokenModel.find({ user_id: getOrder.id_customer["_id"], user_object: "customer" })
            if (arrDeviceToken.length > 0) {
                const payload = {
                    title: title2.vi,
                    body: des2.vi,
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

    async adminChangeStatusOrderToDoing(idAdmin: string, idOrder: string) {
        try {
            const temp = {
                en: "Admin change status order to doing",
                vi: "Admin đã thay đổi trạng thái đơn hàng sang 'đang làm việc'"
            }
            const temp2 = `${idAdmin} đã thay đổi trạng thái làm việc sang đang làm việc của công việc ${idOrder}`
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "admin_change_status_to_order",
                id_order: idOrder,
                date_create: new Date(Date.now()).toISOString()
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async adminChangeStatusOrderToStated(idAdmin: string, idOrder: string) {
        try {
            const temp = {
                en: "Admin change status order to started",
                vi: "Admin đã thay đổi trạng thái đơn hàng sang 'sẵn sàng làm việc'"
            }
            const temp2 = `${idAdmin} đã thay đổi trạng thái làm việc sang 'sẵn sàng làm việc' của công việc ${idOrder}`
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "admin_change_status_to_order",
                id_order: idOrder,
                date_create: new Date(Date.now()).toISOString()
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async adminChangeStatusOrderToDone(idAdmin: string, idOrder: string, idCollaborator, idGroupOrder) {
        try {
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(idCollaborator);
            const getOrder = await this.orderModel.findById(idOrder);
            const getService = await this.serviceModel.findById(getOrder.service["_id"]);
            const temp = {
                en: "Admin change status order to done",
                vi: "Admin đã thay đổi trạng thái làm việc của công việc sang hoàn thành"
            }
            const temp2 = `${idAdmin} đã thay đổi trạng thái làm việc của công việc ${idOrder} sang hoàn thành`
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_collaborator: idCollaborator,
                id_order: idOrder,
                id_group_order: idGroupOrder,
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "admin_change_status_to_order",
                date_create: new Date(Date.now()).toISOString(),
                // value: getOrder.collaborator_fee
            })
            await newItem.save();
            // const title = {
            //     vi: `Hoàn thành công việc`,
            //     en: `Job done successfully`
            // }
            // const description = {
            //     vi: `Bạn đã hoàn thành công việc ${getService.title.vi}`,
            //     en: `You have successfully done job ${getService.title.en}`
            // }
            // const payloadNotification = {
            //     title: title,
            //     description: description,
            //     user_object: "collaborator",
            //     id_collaborator: idCollaborator,
            //     type_notification: "activity",
            //     id_order: idOrder,
            //     id_group_order: idGroupOrder,
            //     related_id: idOrder,
            // }
            // this.notificationSystemService.newActivity(payloadNotification);
            return true;
        } catch (err) {
            // this.logger.error(err.response || err.toString());
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async adminChangeStatusOrderToCancel(idAdmin: string, idOrder: string, idCollaborator, idGroupOrder) {
        try {
            // const getCollaborator = await this.collaboratorModel.findById(idCollaborator);
            const getOrder = await this.orderModel.findById(idOrder);
            const getService = await this.serviceModel.findById(getOrder.service["_id"]);
            const temp = {
                en: "Admin change status order to cancel",
                vi: "Admin đã huỷ công việc"
            }
            const temp2 = `${idAdmin} đã hủy công việc ${idOrder}`
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_order: idOrder,
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "admin_change_status_to_order",
                date_create: new Date(Date.now()).toISOString(),
            })

            await newItem.save();
            const title = {
                vi: `Công việc bị hủy`,
                en: `Job cancel successfully`
            }
            const description = {
                vi: `Công việc ${getService.title.vi} đã bị hủy`,
                en: `Job ${getService.title.en} is cancel`
            }
            const payloadNotification = {
                title: title,
                description: description,
                user_object: "collaborator",
                id_collaborator: idCollaborator,
                type_notification: "activity",
                related_id: idOrder,
                id_order: idOrder,
                id_group_order: idGroupOrder,
            }
            this.notificationSystemService.newActivity(payloadNotification);
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async adminDeleteGroupOrder(idAdmin: string, id: string) {
        try {
            const message = {
                en: 'Delete order successfully',
                vi: 'admin đã xóa một đơn hàng',
            };
            const temp = `${idAdmin} đã xóa đơn hàng ${id} thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_group_order: id,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_delete_group_order',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }
    //////////////////////////////////////////////////////////////////////////
    async updateAccountBank(idCollaborator, idAdmin) {
        try {
            const temp = {
                en: "Admin change account bank of collaborator",
                vi: "Admin đã thay đổi thông tin ngân hàng của CTV"
            }
            const temp2 = `${idAdmin} đã thay đổi thông tin ngân hàng ${idCollaborator}`
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_collaborator: idCollaborator,
                title: temp,
                title_admin: temp2,
                body: temp,
                type: "admin_change_account_bank",
                date_create: new Date(Date.now()).toISOString(),
            })

            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async adminChangeCancelToDone(idAdmin: string, id: string, plaform_fee: number) {
        try {
            const message = {
                en: 'Admin change cancel to done',
                vi: 'admin thay đổi trạng thái đơn hàng từ hủy bỏ sang hoàn thành',
            };
            const temp = `${idAdmin} thay đổi trạng thái đơn hàng ${id} từ hủy bỏ sang hoàn thành`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_group_order: id,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_change_status',
                date_create: new Date(Date.now()).toISOString(),
                value: plaform_fee
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    // async minusPlaformFeeCollaborator(idAdmin: string, id: string) {
    //     try {
    //         const message = {
    //             en: 'Admin change cancel to done',
    //             vi: 'admin thay đổi trạng thái đơn hàng từ hủy bỏ sang hoàn thành',
    //         };
    //         const temp = `${idAdmin} thay đổi trạng thái đơn hàng ${id} từ hủy bỏ sang hoàn thành`;
    //         const newItem = new this.historyActivityModel({
    //             id_admin_action: idAdmin,
    //             id_group_order: id,
    //             title: message,
    //             body: message,
    //             title_admin: temp,
    //             type: 'admin_change_status',
    //             date_create: new Date(Date.now()).toISOString(),
    //         })
    //         await newItem.save();
    //         return true;
    //     } catch (err) {
    //         throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
    //     }
    // }

    async adminMonetaryFine(idAdmin: string, idCollaborator: string, punish, previousBalance?) {
        try {
            const formatMoney = await this.generalHandleService.formatMoney(punish.money);
            const message = {
                en: `Admin has punished collaborators ${formatMoney}`,
                vi: `Admin đã phạt CTV ${formatMoney}`,
            };
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(idCollaborator)
            const temp = `${idAdmin} phạt tiền CTV ${idCollaborator} do ${punish.id_punish} với số tiền ${punish.money}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_collaborator: idCollaborator,
                id_reason_punish: punish.id_punish,
                title: message,
                body: message,
                title_admin: temp,
                type: 'verify_punish_ticket',
                date_create: new Date(Date.now()).toISOString(),
                value: -punish.money,
                current_remainder: getCollaborator.remainder,
                status_current_remainder: (previousBalance.remainder < getCollaborator.remainder) ?
                    "up" : (previousBalance.remainder > getCollaborator.remainder) ? "down" : "none",
                current_gift_remainder: getCollaborator.gift_remainder,
                status_current_gift_remainder: (previousBalance.gift_remainder < getCollaborator.gift_remainder) ?
                    "up" : (previousBalance.gift_remainder > getCollaborator.gift_remainder) ? "down" : "none"
            })
            await newItem.save();

            const description = {
                vi: `Bạn đã bị trừ ${punish.money}đ từ quản trị viên`,
                en: `You have been monetary fine ${punish.money}`
            }
            const payloadNotification = {
                title: description,
                description: description,
                user_object: "collaborator",
                id_collaborator: idCollaborator,
                type_notification: "activity",
                related_id: null
            }
            await this.notificationSystemService.newActivity(payloadNotification);
            const arrDeviceToken = await this.deviceTokenModel.find({ user_id: idCollaborator })
            if (arrDeviceToken.length > 0) {
                const payload = {
                    title: `Bạn bị phạt ${punish.money}`,
                    body: `Bạn bị phạt ${punish.money} vì ${punish.id_punish.title.vi} `,
                    data: { link: "guvipartner://Activity" },
                    token: [arrDeviceToken[0].token]
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

    async systemMonetaryFine(punish: PunishDocument, previousBalance: previousBalanceCollaboratorDTO) {
        try {
            const title = {
                en: 'Monetary fine collaborator success',
                vi: 'Phạt tiền cộng tác viên thành công',
            };
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(punish.id_collaborator);
            const formatMoney = await this.generalHandleService.formatMoney(punish.money);
            const temp = `${getCollaborator._id} bị phạt  ${formatMoney} vì ${punish.id_punish}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: null,
                id_collaborator: getCollaborator._id,
                id_reason_punish: punish.id_punish,
                title: title,
                body: title,
                title_admin: temp,
                type: 'verify_punish_ticket',
                date_create: new Date(Date.now()).toISOString(),
                value: -punish.money,
                id_order: punish.id_order,
                current_work_wallet: getCollaborator.work_wallet,
                status_current_work_wallet: (previousBalance.work_wallet < getCollaborator.work_wallet) ?
                    "up" : (previousBalance.work_wallet > getCollaborator.work_wallet) ? "down" : "none",

                current_collaborator_wallet: Number(getCollaborator.collaborator_wallet),
                status_current_collaborator_wallet: (previousBalance.collaborator_wallet < Number(getCollaborator.collaborator_wallet)) ?
                    "up" : (previousBalance.collaborator_wallet > Number(getCollaborator.collaborator_wallet)) ? "down" : "none"

            })
            await newItem.save();

            // Không bắn thông báo này nữa 
            const description = {
                vi: `Bạn đã bị trừ ${punish.money}đ từ hệ thống`,
                en: `You have been monetary fine ${punish.money}đ`
            }
            const payloadNotification = {
                title: description,
                description: description,
                user_object: "collaborator",
                id_collaborator: getCollaborator._id,
                type_notification: "activity",
                related_id: null
            }
            // Không bắn thông báo này nữa 
            //await this.notificationSystemService.newActivity(payloadNotification);
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }


    async systemMonetaryFinePeriodic(punish: PunishDocument, previousBalance: previousBalanceCollaboratorDTO) {
        try {
            const title = {
                en: 'System monetary fine not pass periodic collaborator',
                vi: 'Hệ thống đã phạt tiền cộng tác viên vì chưa đạt trong bài kiểm tra hàng tháng',
            };
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(punish.id_collaborator)
            const formatMoney = await this.generalHandleService.formatMoney(punish.money);
            const temp = `${getCollaborator._id} bị phạt  ${formatMoney} vì ${punish.id_punish}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: null,
                id_collaborator: getCollaborator._id,
                id_reason_punish: punish.id_punish,
                title: title,
                body: title,
                title_admin: temp,
                type: 'system_verify_punish',
                value: -punish.money,
                id_order: punish.id_order,
                current_remainder: getCollaborator.remainder,
                status_current_remainder: (previousBalance.remainder < getCollaborator.remainder) ?
                    "up" : (previousBalance.remainder > getCollaborator.remainder) ? "down" : "none",

                current_gift_remainder: Number(getCollaborator.gift_remainder),
                status_current_gift_remainder: (previousBalance.gift_remainder < Number(getCollaborator.gift_remainder)) ?
                    "up" : (previousBalance.gift_remainder > Number(getCollaborator.gift_remainder)) ? "down" : "none",

                current_work_wallet: getCollaborator.work_wallet,
                status_current_work_wallet: (previousBalance.work_wallet < getCollaborator.work_wallet) ?
                    "up" : (previousBalance.work_wallet > getCollaborator.work_wallet) ? "down" : "none",

                current_collaborator_wallet: Number(getCollaborator.collaborator_wallet),
                status_current_collaborator_wallet: (previousBalance.collaborator_wallet < Number(getCollaborator.collaborator_wallet)) ?
                    "up" : (previousBalance.collaborator_wallet > Number(getCollaborator.collaborator_wallet)) ? "down" : "none"
            })
            await newItem.save();

            const description = {
                vi: `Bạn đã bị trừ ${punish.money}đ từ hệ thống`,
                en: `You have been monetary fine ${punish.money}đ`
            }
            const payloadNotification = {
                title: title,
                description: title,
                user_object: "collaborator",
                id_collaborator: getCollaborator._id,
                type_notification: "activity",
                related_id: null
            }
            await this.notificationSystemService.newActivity(payloadNotification);
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }


    async adminRefurnMonetaryFine(idCollaborator: string, punish: PunishDocument, idAdmin, previousBalance?) {
        try {
            const title = {
                en: 'Admin cancel punish collaborator',
                vi: 'Quản trị viên đã hủy lệnh phạt tiền của CTV',
            };
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(idCollaborator)
            const formatMoney = await this.generalHandleService.formatMoney(punish.money);
            const temp = `${idCollaborator} được hoàn  ${formatMoney} từ lệnh phạt ${punish._id}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_collaborator: idCollaborator,
                id_reason_punish: punish.id_punish,
                title: title,
                body: title,
                title_admin: temp,
                type: 'admin_cancel_punish',
                date_create: new Date(Date.now()).toISOString(),
                value: punish.money,
                id_order: punish.id_order,
                id_punish: punish._id,
                current_remainder: getCollaborator.remainder,
                status_current_remainder: (previousBalance.remainder < getCollaborator.remainder) ?
                    "up" : (previousBalance.remainder > getCollaborator.remainder) ? "down" : "none",
                current_gift_remainder: getCollaborator.gift_remainder,
                status_current_gift_remainder: (previousBalance.gift_remainder < getCollaborator.gift_remainder) ?
                    "up" : (previousBalance.gift_remainder > getCollaborator.gift_remainder) ? "down" : "none",

                current_work_wallet: getCollaborator.work_wallet,
                status_current_work_wallet: (previousBalance.work_wallet < getCollaborator.work_wallet) ?
                    "up" : (previousBalance.work_wallet > getCollaborator.work_wallet) ? "down" : "none",

                current_collaborator_wallet: Number(getCollaborator.collaborator_wallet),
                status_current_collaborator_wallet: (previousBalance.collaborator_wallet < Number(getCollaborator.collaborator_wallet)) ?
                    "up" : (previousBalance.collaborator_wallet > Number(getCollaborator.collaborator_wallet)) ? "down" : "none"

            })
            await newItem.save();

            const description = {
                vi: `Bạn hoàn ${punish.money}đ từ hệ thống. \nDo quản trị viên đã hủy lệnh phạt`,
                en: `You haven ${punish.money}đ form system. Because admin cancel punish`
            }
            const payloadNotification = {
                title: description,
                description: description,
                user_object: "collaborator",
                id_collaborator: idCollaborator,
                type_notification: "activity",
                related_id: null
            }
            await this.notificationSystemService.newActivity(payloadNotification);
            if (getCollaborator._id) {
                const arrDeviceToken = await this.deviceTokenModel.find({ user_id: getCollaborator._id })
                if (arrDeviceToken.length > 0) {
                    const payload = {
                        title: `Bạn được hoàn ${punish.money}đ`,
                        body: `Bạn được hoàn ${punish.money}đ từ hệ thống`,
                        data: { link: "guvipartner://" },
                        token: [arrDeviceToken[0].token]
                    }
                    for (let i = 1; i < arrDeviceToken.length; i++) {
                        payload.token.push(arrDeviceToken[i].token)
                    }
                    this.notificationService.send(payload)
                }
            }
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }
    /////////////////////////////////// popup ///////////////////////////////////////



    async createPopup(idAdmin: string, id: string) {
        try {
            const message = {
                en: 'Create new popup successfully',
                vi: 'Tạo mới popup thành công',
            };
            const temp = `${idAdmin} đã tạo mới popup ${id} thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_create_popup',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async editPopup(idAdmin: string, id: string) {
        try {
            const message = {
                en: 'Edit popup successfully',
                vi: 'Chỉnh sửa popup thành công',
            };
            const temp = `${idAdmin} đã chỉnh sửa popup ${id} thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_user_system: id,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_edit_popup',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async changeStatusPopup(idAdmin: string, id: string) {
        try {
            const message = {
                en: 'Change status popup successfully',
                vi: 'Đã thay đổi trạng thái popup thành công',
            };
            const temp = `${idAdmin} đã thay đổi trạng thái của popup ${id} thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_user_system: id,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_change_status_popup',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async deletePopup(idAdmin: string, id: string) {
        try {
            const message = {
                en: 'Delete popup successfully',
                vi: 'Xóa popup thành công',
            };
            const temp = `${idAdmin} đã xóa popup ${id} thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_user_system: id,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_delete_popup',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async activePopup(idAdmin: string, id: string) {
        try {
            const message = {
                en: 'Active popup successfully',
                vi: 'Thay đổi active popup thành công',
            };
            const temp = `${idAdmin} đã thay đổi active của popup ${id} thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_user_system: id,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_acti_popup',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    ////////////////////////////////////////////////////////////////////////////////////////

    async adminContactCustomerRequest(idAdmin, idRequest, idCustomer) {
        try {
            const message = {
                en: 'Admin contact customer request',
                vi: 'Admin đã liên hệ tư vấn cho khách hàng',
            };
            const temp = `${idAdmin} đã liên hệ tư vấn cho khách ${idCustomer} với yêu cầu ${idRequest}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_contact_customer_request',
                date_create: new Date(Date.now()).toISOString(),
                id_customer_request: idRequest,
                id_customer: idCustomer,
            });
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async adminChangeStatusCustomerRequest(idAdmin, idRequest, idCustomer, status) {
        try {
            const message = {
                en: 'Admin change status customer request',
                vi: 'Admin thay đổi trạng thái yêu cầu của khách hàng',
            };
            const temp = `${idAdmin} đã thay đổi trạng thái yêu cầu của khách hàng ${idCustomer} thành ${status === "done" ? "hoàn tất" : "hủy"}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_change_status_customer_request',
                date_create: new Date(Date.now()).toISOString(),
                id_customer_request: idRequest,
                id_customer: idCustomer,
            });
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async adminDeleteCustomerRequest(idAdmin, idRequest, idCustomer) {
        try {
            const message = {
                en: 'Admin delete customer request',
                vi: 'Admin đã xóa yêu cầu của khách hàng',
            };
            const temp = `${idAdmin} đã xóa yêu cầu của khách hàng ${idCustomer} với yêu cầu ${idRequest}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_delete_customer_request',
                date_create: new Date(Date.now()).toISOString(),
                id_customer_request: idRequest,
                id_customer: idCustomer,
            });
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }
    /////////////////////////////////////////////////////////////////////////////////////////////

    async adminTopUpPointCustomer(idAdmin, idTransitionPoint, idCustomer, value) {
        try {
            const message = {
                en: 'Admin create top up point customer',
                vi: 'Admin đã tạo yêu cầu nạp điểm cho khách hàng',
            };
            const temp = `${idAdmin} đã tạo yêu cầu nạp điểm cho khách hàng ${idCustomer} với yêu cầu ${idTransitionPoint}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_top_up_transition_point_customer',
                date_create: new Date(Date.now()).toISOString(),
                id_transistion_point: idTransitionPoint,
                id_customer: idCustomer,
                value: value
            });
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async adminVerifyPointCustomer(idAdmin, idTransitionPoint, idCustomer, value) {
        try {
            const message = {
                en: 'Admin verify point customer',
                vi: 'Admin đã phê duyệt yêu cầu nạp điểm cho khách hàng',
            };
            const temp = `${idAdmin} đã phê duyệt yêu cầu nạp điểm cho khách hàng ${idCustomer} với yêu cầu ${idTransitionPoint}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_verify_transition_point_customer',
                date_create: new Date(Date.now()).toISOString(),
                id_transistion_point: idTransitionPoint,
                id_customer: idCustomer,
                value: value
            });
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async adminCancelPointCustomer(idAdmin, idTransitionPoint) {
        try {
            const message = {
                en: 'Admin cancel point customer',
                vi: 'Admin đã hủy yêu cầu nạp điểm cho khách hàng',
            };
            const temp = `${idAdmin} đã hủy yêu cầu nạp điểm ${idTransitionPoint}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_cancel_transition_point_customer',
                date_create: new Date(Date.now()).toISOString(),
                id_transistion_point: idTransitionPoint,
            });
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async adminDeletePointCustomer(idAdmin, idTransitionPoint) {
        try {
            const message = {
                en: 'Admin delete point customer',
                vi: 'Admin đã xóa yêu cầu nạp điểm của khách hàng',
            };
            const temp = `${idAdmin} đã xóa yêu cầu nạp điểm ${idTransitionPoint}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_delete_transition_point_customer',
                date_create: new Date(Date.now()).toISOString(),
                id_transistion_point: idTransitionPoint,
            });
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }


    async createNewGroupOrder(customer, groupOrder, service, admin, isNoAddCollaborator) {
        try {
            const temp = {
                en: "Create order successfully",
                vi: "Tạo dịch vụ thành công"
            }
            const getService = await this.serviceModel.findById(service._id);
            let temp2 = `${admin.full_name} đã tạo thành công dịch vụ ${getService.title.vi} cho khách hàng ${customer.full_name}`;
            const newItem = new this.historyActivityModel({
                id_customer: customer._id,
                id_user_system: admin._id,
                title: temp,
                body: temp,
                title_admin: temp2,
                type: "admin_create_group_order",
                id_group_order: groupOrder._id,
                id_order: groupOrder.id_order[0],
                date_create: new Date(Date.now()).toISOString(),
            })

            const title = {
                vi: `GUVI`,
                en: `GUVI`
            }
            const description = {
                vi: `GUVI đang tìm kiếm "Cộng tác viên" cho bạn. Nhấp để xem chi tiết.`,
                en: `GUVI is looking for "Collaborators" for you. Click to see details.`
            }
            const payloadNotification = {
                title: title,
                description: description,
                user_object: "customer",
                id_customer: customer._id,
                type_notification: "activity",
                id_group_order: groupOrder._id,
                type_schedule: groupOrder.type
            }
            await this.notificationSystemService.newActivity(payloadNotification);
            await newItem.save();

            if (groupOrder.id_customer) {
                const arrDeviceToken = await this.deviceTokenModel.find({ user_id: groupOrder.id_customer })
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

            if (isNoAddCollaborator) {
                if (groupOrder.id_favourite_collaborator.length > 0) {
                    const tempId = await this.collaboratorSystemService.collaboratorFavourite(groupOrder);
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
                    const tempId = await this.collaboratorSystemService.collaboratorInDistrict(groupOrder);
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
            }
            //if (groupOrder.id_favourite_collaborator.length > 0) {
            //     this.pushNotiSystemService.pushNotiCollaboratorFavorite(groupOrder)
            // } else {
            //     this.pushNotiSystemService.pushNotiCollaborator(groupOrder)
            // }
            return true;
        } catch (err) {
            console.error(err.response || err.toString());
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async adminAssignCollaborator(admin, idCollaborator, grOrder) {
        try {
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(idCollaborator);
            const message = {
                vi: `${admin._id} đã gán đơn ${grOrder.id_view} cho CTV ${getCollaborator.id_view}`,
                en: `${admin._id} assigned group order ${grOrder.id_view} for collaborator ${getCollaborator.id_view}`
            };
            const title_admin = `${admin._id} đã gán đơn ${grOrder.id_view} cho CTV ${getCollaborator.full_name}`;
            await this.historyActivityRepositoryService.create({
                id_collaborator: idCollaborator,
                id_customer: grOrder.id_customer,
                id_admin_action: admin._id,
                id_group_order: grOrder._id,
                title: message,
                body: message,
                title_admin: title_admin,
                type: 'admin_assign_collaborator',
                date_create: new Date(Date.now()).toISOString(),
            });
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async editGroupOrder(idCustomer, idGroupOrder, idService, idAdmin) {
        try {
            const getCustomer = await this.customerRepositoryService.findOneById(idCustomer);
            const getService = await this.serviceModel.findById(idService);
            const getGroupOrder = await this.groupOrderModel.findById(idGroupOrder);
            const temp = {
                en: "Edit order successfully",
                vi: "Chỉnh sửa dịch vụ thành công"
            }
            let temp2 = `${getCustomer._id} đã chỉnh sửa thành công dịch vụ ${getService.title.vi}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_customer: idCustomer.toString(),
                title: temp,
                body: temp,
                title_admin: temp2,
                type: "admin_edit_group_order",
                id_group_order: idGroupOrder,
                date_create: new Date(Date.now()).toISOString(),

            })
            const title = {
                vi: `Dịch vụ ${getService.title.vi.toLowerCase()}`,
                en: `${getService.title.en} Service`
            }
            const description = {
                vi: `Bạn đã thay đổi thành công dịch vụ ${getService.title.vi.toLowerCase()}`,
                en: `You had change service ${getService.title.en.toLowerCase()} successfully`
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
            if (getGroupOrder.id_favourite_collaborator.length === 0) {
                await this.pushNotiSystemService.pushNotiCollaborator(getGroupOrder);
            } else {
                await this.pushNotiSystemService.pushNotiCollaboratorFavorite(getGroupOrder);
            }

            return true;
        } catch (err) {
            console.error(err.response || err.toString());
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    /////////////////////////////////////// ExamTest //////////////////////////////////////
    async createExamtest(idAdmin: string, idQuestion: string) {
        try {
            const message = {
                en: 'Create question successfully',
                vi: 'Tạo mới câu hỏi thành công',
            }
            const getAdmin = await this.userSystemModel.findById(idAdmin);
            const getExam = await this.examTestModel.findById(idQuestion);
            const temp = `${getAdmin._id} đã tạo mới câu hỏi ${getExam._id} thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_question: idQuestion,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_create_question',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async activeExamTest(idAdmin: string, idQuestion: string) {
        try {
            const message = {
                en: 'Change active question successfully',
                vi: 'Thay đổi trạng thái câu hỏi thành công',
            }
            const getAdmin = await this.userSystemModel.findById(idAdmin);
            const getExamtest = await this.examTestModel.findById(idQuestion);
            const temp = `${getAdmin._id} đã thay đổi trạng thái của câu hỏi ${getExamtest._id} thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_question: idQuestion,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_active_question',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async editExamtest(idAdmin: string, idQuestion: string) {
        try {
            const message = {
                en: 'Admin edit question successfully',
                vi: 'Quản trị viên đã chỉnh sửa thông tin câu hỏi',
            }
            const temp = `${idAdmin} đã chỉnh sửa thông tin câu hỏi ${idQuestion} thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_question: idQuestion,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_edit_question',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async deleteExamTest(idAdmin: string, idQuestion: string) {
        try {
            const message = {
                en: 'Delete question successfully',
                vi: 'Xóa câu hỏi thành công',
            }
            const getAdmin = await this.userSystemModel.findById(idAdmin);
            const getExamtest = await this.examTestModel.findById(idQuestion);
            const temp = `${getAdmin._id} đã xóa câu hỏi ${getExamtest._id} thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_question: idQuestion,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_delete_question',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async deleteInfoTestCollaborator(idAdmin: string, idInfo: string) {
        try {
            const message = {
                en: 'Delete Information successfully',
                vi: 'Xóa thông tin thành công',
            }
            const getAdmin = await this.userSystemModel.findById(idAdmin);
            const getInfoTest = await this.infoTestCollaboratorModel.findById(idInfo);
            const temp = `${getAdmin._id} đã xóa thông tin ${getInfoTest._id} thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_info: idInfo,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_delete_info_test',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    /////////////////////////////////////////////////


    async adminChangeCollaborator(idAdmin, idCollaborator, idGroupOrder) {
        try {
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(idCollaborator);
            const getGroupOrder = await this.groupOrderModel.findById(idGroupOrder);
            console.log(getGroupOrder, "group order");

            const getCustomer = await this.customerRepositoryService.findOneById(getGroupOrder.id_customer.toString());
            const message = {
                en: 'Admin changed collaborator in group order',
                vi: 'Admin đã thay đổi CTV cho đơn hàng',
            };
            const temp = `${idAdmin} đã thay đổi CTV ${idCollaborator} trong công việc`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_change_collaborator',
                date_create: new Date(Date.now()).toISOString(),
                id_group_order: idGroupOrder,
                id_collaborator: idCollaborator
            });
            await newItem.save();
            // ban noti cho KH
            const title = {
                vi: 'GUVI',
                en: 'GUVI'
            }
            const description = {
                vi: `"Cộng tác viên" của đơn ${getGroupOrder.id_view} đã được thay đổi. Chúng tôi đang thay đổi "Cộng tác viên ${getCollaborator.full_name}".
                Nhấn đây để kiểm tra lại thông tin nhé !!!`,
                en: `The "Collaborator" of the order ${getGroupOrder.id_view} has been changed. We are changing "Collaborator ${getCollaborator.full_name}".
                Click here to check the information again!!!`
            }
            const payloadNotiCustomer = {
                title,
                description,
                user_object: "customer",
                id_customer: getCustomer._id,
                type_notification: "activity",
                related_id: idGroupOrder,
                id_group_order: idGroupOrder
            }
            this.notificationSystemService.newActivity(payloadNotiCustomer)
            const payloadPushNoti = {
                title: title.vi,
                body: description.vi,
                user_object: "customer",
                user_id: getCustomer._id,
                data: "guviapp://"
            }
            this.pushNotiSystemService.pushNoti(payloadPushNoti);
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async punishCollaborator(admin: UserSystemDocument, collaborator: CollaboratorDocument, transfer: TransactionDocument) {
        try {
            const message = {
                en: 'Create punish collaborator',
                vi: 'Đã tạo lệnh phạt tiền cho cộng tác viên',
            }
            const temp = `${admin._id} đã tạo lệnh phạt ${transfer._id} cho tác viên ${collaborator._id}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: admin._id,
                id_collaborator: collaborator._id,
                id_transaction: transfer._id,
                id_reason_punish: transfer.id_reason_punish,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_monetary_fine_collaborator',
                date_create: new Date(Date.now()).toISOString(),
                value: transfer.money
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async adminChangeStatusPunishToCancel(idAdmin: string, idPunish: string, idCollaborator) {
        try {
            // const getCollaborator = await this.collaboratorModel.findById(idCollaborator);
            const getPunish = await this.punishModel.findById(idPunish);
            const temp = {
                en: "Admin change status punnish to cancel",
                vi: "Admin đã huỷ phạt tiền"
            }
            const temp2 = `${idAdmin} đã hủy phạt tiền ${idPunish}`
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_collaborator: idCollaborator,
                id_punish: idPunish,
                title: temp,
                title_admin: temp2,
                value: getPunish.money,
                body: temp,
                type: "admin_change_status_to_punish",
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async adminDeletePunish(idAdmin: string, idPunish: string, idCollaborator) {
        try {
            // const getCollaborator = await this.collaboratorModel.findById(idCollaborator);
            const getPunish = await this.punishModel.findById(idPunish);
            const temp = {
                en: "Admin change status punnish to cancel",
                vi: "Admin đã xoá lệnh phạt tiền"
            }
            const temp2 = `${idAdmin} đã xoá lệnh phạt tiền ${idPunish}`
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_collaborator: idCollaborator,
                id_punish: idPunish,
                title: temp,
                title_admin: temp2,
                value: getPunish.money,
                body: temp,
                type: "admin_delete_punish",
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async editPunish(idAdmin: string, id: string) {
        try {
            const message = {
                en: 'Edit punish',
                vi: 'Đã chỉnh sửa thông tin lệnh phạt tiền',
            }
            const getPunish = await this.punishModel.findById(id);
            const getAdmin = await this.userSystemModel.findById(idAdmin);
            const temp = `${getAdmin._id} đã chỉnh sửa thông tin lệnh phạt tiền ${getPunish._id}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_collaborator: getPunish.id_collaborator,
                id_punish: id,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_edit_punish',
                value: getPunish.money,
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async systemPunishCollaborator(idCollaborator: string, payload) {
        try {
            const message = {
                en: 'Collaborator fine system',
                vi: 'Hệ thống đã phạt tiền cho cộng tác viên',
            }
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(idCollaborator);
            const temp = `Hệ thống đã phạt tiền ${payload._id} cho cộng tác viên ${getCollaborator._id}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: null,
                id_collaborator: idCollaborator,
                title: message,
                body: message,
                title_admin: temp,
                type: 'system_monetary_fine_collaborator',
                date_create: new Date(Date.now()).toISOString(),
                value: -payload.money,
                id_order: payload.id_order
            })
            await newItem.save();

            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }
    //////////////////////////////////////////////////////
    async adminChangeDateWorkOrder(idOrder: string, idAdmin: string) {
        try {
            const getAdmin = await this.userSystemModel.findById(idAdmin);

            const message = {
                en: 'Admin change date work order',
                vi: 'Quản trị viên đã thay đổi thời gian làm việc của ca làm',
            }
            const getOrder = await this.orderModel.findById(idOrder)
                .populate(POP_CUSTOMER_INFO)
                .populate(POP_COLLABORATOR_INFO);

            const temp = `QTV ${getAdmin.full_name} đã thay đổi thời gian làm việc của ca làm ${getOrder.id_view}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_change_date_work',
                date_create: new Date(Date.now()).toISOString(),
                id_order: idOrder
            })
            await newItem.save();
            ///////////// ban thong bao cho KH /////////////
            const title_noti_customer = {
                vi: `GUVI`,
                en: `GUVI`
            }
            const time_start = await this.generalHandleService.formatDateWithTimeZone(new Date(getOrder.date_work), 'Asia/Ho_Chi_Minh')
            const time_end = await this.generalHandleService.formatDateWithTimeZone(new Date(getOrder.end_date_work), 'Asia/Ho_Chi_Minh')

            const description_noti_customer = {
                vi: `Thời gian làm việc của đơn ${getOrder.id_view} đã được điều chỉnh. Thời gian sẽ thay đổi thành ${time_start.time} - ${time_end.time} ${time_start.time_date}.
                Nhấn đây để kiểm tra lại thông tin nhé !!!`,
                en: `Order working hours ${getOrder.id_view} have been changed. The time will change to ${time_start.time} - ${time_end.time} ${time_start.time_date}.
                Click here to check the information again!!!`
            }

            const payloadNotificationCustomer = {
                title: title_noti_customer,
                description: description_noti_customer,
                user_object: "customer",
                id_customer: getOrder.id_customer["_id"],
                type_notification: "activity",
                related_id: getOrder._id,
                id_order: getOrder._id
            }
            // this.notificationSystemService.newActivity(payloadNotificationCustomer);
            ///////////// end ban thong bao cho KH /////////////

            ///////////// ban thong bao cho CTV /////////////
            if (getOrder.id_collaborator && getOrder.id_collaborator["_id"]) {
                const title = {
                    vi: `Công việc của khách ${getOrder.id_customer["full_name"]} đã được hệ thống thay đổi giờ làm việc`,
                    en: `Guest job ${getOrder.id_customer["full_name"]} has been changed date work by system`
                }
                const description = {
                    vi: `Công việc của khách ${getOrder.id_customer["full_name"]} đã được hệ thống thay đổi giờ làm việc.\n Bạn vui lòng kiểm tra lại thời gian làm việc mới và sắp xếp thời gian hợp lý!!!`,
                    en: `Guest job ${getOrder.id_customer["full_name"]} has been changed by system.\n Please check the new working time and arrange a reasonable time!!!`
                }
                const payloadNotification = {
                    title: title,
                    description: description,
                    user_object: "collaborator",
                    id_collaborator: getOrder.id_collaborator["_id"],
                    type_notification: "system",
                    related_id: getOrder._id,
                    id_order: getOrder._id
                }
                await newItem.save();
                this.notificationSystemService.newActivity(payloadNotification);

                const payloadPushNoti: pushNotiDTO = {
                    title: title.vi,
                    body: description.vi,
                    data: "guvipartner://Activity",
                    user_id: getOrder.id_collaborator["_id"],
                }
                this.pushNotiSystemService.pushNoti(payloadPushNoti);
            }

            ///////////// end ban thong bao cho CTV /////////////
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    //////////////////////////////// Reward Collaborator //////////////////////
    async createRewardCollaborator(idAdmin: string, idReward: string) {
        try {
            const message = {
                en: 'Create reward for collaborator successfully',
                vi: 'Tạo mới thưởng cho CTV thành công',
            }
            const getAdmin = await this.userSystemModel.findById(idAdmin);
            const getReward = await this.rewardCollaboratorModel.findById(idReward);
            const temp = `${getAdmin._id} đã tạo mới thưởng ${getReward._id} thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_reward: idReward,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_create_reward',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async activeRewardCollaborator(idAdmin: string, idReward: string) {
        try {
            const message = {
                en: 'Change active reward successfully',
                vi: 'Thay đổi trạng thái thưởng thành công',
            }
            const getAdmin = await this.userSystemModel.findById(idAdmin);
            const getReward = await this.rewardCollaboratorModel.findById(idReward);
            const temp = `${getAdmin._id} đã thay đổi trạng thái của câu hỏi ${getReward._id} thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_reward: idReward,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_active_reward',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async editRewardCollaborator(idAdmin: string, idReward: string) {
        try {
            const message = {
                en: 'Edit reward successfully',
                vi: 'Chỉnh sửa thông tin thưởng thành công',
            }
            const getAdmin = await this.userSystemModel.findById(idAdmin);
            const getReward = await this.rewardCollaboratorModel.findById(idReward);
            const temp = `${getAdmin._id} đã chỉnh sửa thông tin thưởng ${getReward._id} thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_reward: idReward,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_edit_reward',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async deleteRewardCollaborator(idAdmin: string, idReward: string) {
        try {
            const message = {
                en: 'Delete reward successfully',
                vi: 'Xóa thưởng thành công',
            }
            const getAdmin = await this.userSystemModel.findById(idAdmin);
            const getReward = await this.rewardCollaboratorModel.findById(idReward);
            const temp = `${getAdmin._id} đã xóa thưởng ${getReward._id} thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_reward: idReward,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_delete_reward',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async adminCancelOrder(idCustomer, idOrder, idGroupOrder, idReasonCancel, idAdmin) {
        try {
            const getCustomer = await this.customerRepositoryService.findOneById(idCustomer);
            const getOrder = await this.orderModel.findById(idOrder);
            const getGroupOrder = await this.groupOrderModel.findById(idGroupOrder);
            const temp = {
                en: "Cancel order successfully",
                vi: "Huỷ công việc thành công"
            }
            let temp2 = `${idAdmin} đã hủy công việc ${idOrder} của khách hàng ${getCustomer._id} với lý do "${idReasonCancel}"`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_customer: idCustomer.toString(),
                title: temp,
                body: temp,
                title_admin: temp2,
                type: 'admin_cancel_order',
                id_order: idOrder,
                id_group_order: idGroupOrder,
                date_create: new Date(Date.now()).toISOString(),
                id_reason_cancel: idReasonCancel
            })
            await newItem.save();

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
            const description = {
                vi: `Đơn ${getGroupOrder.id_view} đã được hủy. Hãy thử đặt lại vào một khung giờ khác thử xem nhé!`,
                en: `Order ${getGroupOrder.id_view} was canceled. Please try booking again at another time!`
            }
            const payloadNotiCustomer = {
                title: "GUVI",
                body: description.vi,
                data: "guviapp://",
                user_id: getCustomer._id,
                user_object: "customer",
            }
            this.pushNotiSystemService.pushNoti(payloadNotiCustomer)
            return true;
        } catch (err) {
            // this.logger.error(err.response || err.toString());
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    /////////////////////////////////////// Collaborator_Bonus //////////////////////////////////////
    async createCollaboratorBonus(idAdmin: string, idBonus: string) {
        try {
            const message = {
                en: 'Create bonus for collaborator successfully',
                vi: 'Tạo mới thưởng cho CTV thành công',
            }
            const getAdmin = await this.userSystemModel.findById(idAdmin);
            const getBonus = await this.collaboratorBonusModel.findById(idBonus);
            const temp = `${getAdmin._id} đã tạo mới thưởng ${getBonus._id} cho CTV thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_collaborator_bonus: idBonus,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_create_collaborator_bonus',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async activeCollaboratorBonus(idAdmin: string, idBonus: string) {
        try {
            const message = {
                en: 'Change active bonus for collaborator successfully',
                vi: 'Thay đổi thưởng cho CTV thành công',
            }
            const getAdmin = await this.userSystemModel.findById(idAdmin);
            const getBonus = await this.collaboratorBonusModel.findById(idBonus);
            const temp = `${getAdmin._id} đã thay đổi trạng thái thưởng  ${getBonus._id} cho CTV thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_collaborator_bonus: idBonus,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_active_collaborator_bonus',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async editCollaboratorBonus(idAdmin: string, idBonus: string) {
        try {
            const message = {
                en: 'Edit bonus for collaborator successfully',
                vi: 'Chỉnh sửa thưởng cho CTV thành công',
            }
            const getAdmin = await this.userSystemModel.findById(idAdmin);
            const getBonus = await this.collaboratorBonusModel.findById(idBonus);
            const temp = `${getAdmin._id} đã chỉnh sửa thưởng ${getBonus._id} cho CTV thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_collaborator_bonus: idBonus,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_edit_collaborator_bonus',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async deleteCollaboratorBonus(idAdmin: string, idBonus: string) {
        try {
            const message = {
                en: 'Delete bonus for collaborator successfully',
                vi: 'Xóa thưởng cho CTV thành công',
            }
            const getAdmin = await this.userSystemModel.findById(idAdmin);
            const getBonus = await this.collaboratorBonusModel.findById(idBonus);
            const temp = `${getAdmin._id} đã xóa thưởng ${getBonus._id} cho CTV thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_collaborator_bonus: idBonus,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_delete_collaborator_bonus',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async adminCheckReview(idAdmin: string, idOrder: string) {
        try {
            const message = {
                en: 'Admin check review order',
                vi: 'Quản trị viên đã kiểm tra đánh giá đơn hàng',
            }
            const temp = `${idAdmin} kiểm tra đánh giá đơn hàng ${idOrder} thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_order: idOrder,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_check_review',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }
    /////////////////////////////////////// info reward collaboratr //////////////////////////////////////
    async createInfoRewardCollaborator(idInfo: string, idAdmin?: string,) {
        try {
            const message = {
                en: 'Create info reward collaborator successfully',
                vi: 'Tạo mới lệnh thưởng cho CTV thành công',
            }
            const getAdmin = await this.userSystemModel.findById(idAdmin);
            const getInfo = await this.infoRewardCollaboratorModel.findById(idInfo);
            const temp = `${getInfo.id_admin_action ? getAdmin._id : 'Hệ thống'
                } đã tạo mới lệnh thưởng ${getInfo._id} cho CTV ${getInfo.id_collaborator} thành công`;
            'system_create_info_reward_collaborator'
            'admin_create_collaborator_bonus'
            const newItem = new this.historyActivityModel({
                id_admin_action: getInfo.id_admin_action,
                id_collaborator: getInfo.id_collaborator,
                id_info_reward_collaborator: getInfo._id,
                title: message,
                body: message,
                title_admin: temp,
                type: getInfo.id_admin_action ? 'admin_create_info_reward_collaborator' : 'system_create_info_reward_collaborator',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async editInfoRewardCollaborator(idAdmin: string, idBonus: string) {
        try {
            const message = {
                en: 'Edit bonus for collaborator successfully',
                vi: 'Chỉnh sửa thưởng cho CTV thành công',
            }
            const getAdmin = await this.userSystemModel.findById(idAdmin);
            const getBonus = await this.collaboratorBonusModel.findById(idBonus);
            const temp = `${getAdmin._id} đã chỉnh sửa thưởng ${getBonus._id} cho CTV thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_collaborator_bonus: idBonus,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_edit_collaborator_bonus',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async deleteInfoRewardCollaborator(idAdmin: string, infoReward: InfoRewardCollaboratorDocument) {
        try {
            const message = {
                en: 'Delete info reward collaborator successfully',
                vi: 'Xóa phần thưởng của CTV thành công',
            }
            const temp = `${idAdmin} đã xóa phần thưởng ${infoReward._id} của CTV ${infoReward.id_collaborator} thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_collaborator: infoReward.id_collaborator,
                id_info_reward_collaborator: infoReward._id.toString(),
                title: message,
                body: message,
                title_admin: temp,
                type: "admin_delete_info_reward_collaborator",
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async cancelInfoRewardCollaborator(idAdmin: string, infoReward: InfoRewardCollaboratorDocument) {
        try {
            const message = {
                en: 'Cancel info reward collaborator successfully',
                vi: 'Hủy phần thưởng của CTV thành công',
            }
            const temp = `${idAdmin} đã hủy phần thưởng ${infoReward._id} của CTV ${infoReward.id_collaborator} thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_collaborator: infoReward.id_collaborator,
                id_info_reward_collaborator: infoReward._id.toString(),
                title: message,
                body: message,
                title_admin: temp,
                type: "admin_cancel_info_reward_collaborator",
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async verifyInfoRewardCollaborator(inforReward: InfoRewardCollaboratorDocument, previousBalance) {
        try {
            const message = {
                en: 'Verify info reward collaborator successfully',
                vi: 'Đã duyệt phần thưởng cho CTV thành công',
            }
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(inforReward.id_collaborator)
            const temp = `${inforReward.id_admin_verify ? inforReward.id_admin_verify : 'Hệ thống'} đã duyệt phần thưởng ${inforReward._id} cho CTV ${inforReward.id_collaborator} thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: inforReward.id_admin_verify,
                id_info_reward_collaborator: inforReward._id,
                id_collaborator: inforReward.id_collaborator,
                title: message,
                body: message,
                title_admin: temp,
                type: inforReward.id_admin_verify ? 'admin_verify_info_reward_collaborator' : 'system_verify_info_reward_collaborator',
                date_create: new Date(Date.now()).toISOString(),
                value: inforReward.money,
                current_remainder: getCollaborator.remainder,
                status_current_remainder: (previousBalance.remainder < getCollaborator.remainder) ?
                    "up" : (previousBalance.remainder > getCollaborator.remainder) ? "down" : "none",
                current_gift_remainder: getCollaborator.gift_remainder,
                status_current_gift_remainder: (previousBalance.gift_remainder < getCollaborator.gift_remainder) ?
                    "up" : (previousBalance.gift_remainder > getCollaborator.gift_remainder) ? "down" : "none"
            })
            await newItem.save();

            const title = {
                vi: `Tặng tiền thưởng hiệu suất công việc`,
                en: `Given money efficiency jobs`
            }
            const description = {
                vi: `Bạn được tặng ${inforReward.money} vì đã đạt hiệu suất trong công việc`,
                en: `You have given ${inforReward.money} because efficiency jobs`
            }
            const payloadNotification = {
                title: title,
                description: description,
                user_object: "collaborator",
                id_collaborator: inforReward.id_collaborator,
                type_notification: "activity",
            }
            this.notificationSystemService.newActivity(payloadNotification);
            const arrDeviceToken = await this.deviceTokenModel.find({ user_id: inforReward.id_collaborator, user_object: "collaborator" })
            if (arrDeviceToken.length > 0) {
                const payload = {
                    title: "Bạn được thưởng tiền",
                    body: "Bạn được thưởng tiền hiệu suất vì đã đạt số công việc quy định",
                    token: [arrDeviceToken[0].token],
                    data: { link: "guvipartner://" },
                }
                for (let i = 1; i < arrDeviceToken.length; i++) {
                    payload.token.push(arrDeviceToken[i].token)
                }
                this.notificationService.send(payload)
            }
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }
    ////////////////////////////////// training lesson ///////////////////////////////////////////
    async createTrainingLesson(idAdmin: string, idTrainingLesson: string) {
        try {
            const message = {
                en: 'Admin create training lesson successfully',
                vi: 'Quản trị viên đã tạo thành công bài kiểm tra thành công',
            }
            const temp = `${idAdmin} đã tạo mới bài kiểm tra ${idTrainingLesson} thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_training_lesson: idTrainingLesson,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_create_training_lesson',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async activeTrainingLesson(idAdmin: string, idTrainingLesson: string) {
        try {
            const message = {
                en: 'Admin change status activity for training lesson',
                vi: 'Quản trị viên đã thay đổi trạng thái của bài kiểm tra',
            }
            const temp = `${idAdmin} đã thay đổi trạng thái của bài kiểm tra ${idTrainingLesson} thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_training_lesson: idTrainingLesson,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_active_training_lesson',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async editTrainingLesson(idAdmin: string, idTrainingLesson: string) {
        try {
            const message = {
                en: 'Admin edit training lesson successfully',
                vi: 'Quản trị viên đã chỉnh sửa bài kiểm tra thành công',
            }
            const temp = `${idAdmin} đã chỉnh sửa thông tin bài kiểm tra thành công ${idTrainingLesson} thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_training_lesson: idTrainingLesson,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_edit_training_lesson',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async deleteTrainingLesson(idAdmin: string, idTrainingLesson: string) {
        try {
            const message = {
                en: 'Admin delete training lesson successfully',
                vi: 'Quản trị viên đã xóa bài kiểm tra thành công',
            }
            const temp = `${idAdmin} đã xóa bài kiểm tra ${idTrainingLesson} thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_training_lesson: idTrainingLesson,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_delete_training_lesson',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async setCustomerIsStaff(idAdmin: string, idCustomer: string) {
        try {
            const message = {
                en: 'Admin set customer is staff of company',
                vi: 'Quản trị viên đã cài đặt khách hàng thành nhân viên công ty thành công',
            }
            const temp = `${idAdmin} đã cài đặt ${idCustomer} là nhân viên công ty`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_customer: idCustomer,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_set_is_staff',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async unSetCustomerIsStaff(idAdmin: string, idCustomer: string) {
        try {
            const message = {
                en: 'Admin cancel customer is staff of company',
                vi: 'Quản trị đã hủy tư cách nhân viên công ty của khách hàng',
            }
            const temp = `${idAdmin} đã hủy tư cách nhân viên của ${idCustomer} thành công`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_customer: idCustomer,
                title: message,
                body: message,
                title_admin: temp,
                type: 'admin_unset_is_staff',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async adminChangeMoneyWallet(idCollaborator: string, money: number, idAdmin: string) {
        try {
            const message = {
                en: 'The administrator has helped to transfer money to the work wallet for the collaborator',
                vi: 'Quản trị đã hỗ trợ chuyển tiền sang ví công việc cho cộng tác viên',
            }
            const formatMoney = await this.generalHandleService.formatMoney(money);
            const title_admin = `${idAdmin} đã hỗ trợ ${idCollaborator} chuyển ${formatMoney} sang ví công việc`;
            const newItem = new this.historyActivityModel({
                id_admin_action: idAdmin,
                id_collaborator: idCollaborator,
                title: message,
                body: message,
                title_admin: title_admin,
                type: 'admin_support_change_money_wallet',
                value: money,
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async adminUpdateHandleStatusCollaborator(collaborator: CollaboratorDocument, admin: UserSystemDocument, status) {
        try {
            const message = {
                en: 'The administrator has changed the account status',
                vi: 'Quản trị viên đã thay đổi trạng thái tài khoản',
            }

            const temp = OPTIONS_SELECT_STATUS_COLLABORATOR.filter(x => x.value === status)
            let textStatus = "";
            if (temp.length > 0) textStatus = temp[0].label;


            const title_admin = `${admin._id} đã cập nhật trạng thái thành ${textStatus} cho ${collaborator._id}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: admin._id,
                id_collaborator: collaborator._id,
                title: message,
                body: message,
                title_admin: title_admin,
                type: 'admin_update_status_collaborator',
                value_select: status,
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async adminUpdateHandleNoteAdminCollaborator(collaborator: CollaboratorDocument, admin: UserSystemDocument, noteAdmin) {
        try {
            const message = {
                en: 'The administrator has changed the account status',
                vi: 'Quản trị viên đã thay đổi ghi chú tài khoản',
            }
            const title_admin = `${admin._id} đã cập nhật ghi chú cho ${collaborator._id}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: admin._id,
                id_collaborator: collaborator._id,
                title: message,
                body: message,
                title_admin: title_admin,
                type: 'admin_update_note_admin_collaborator',
                value_string: noteAdmin,
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async adminCreatePunishPolicy(admin, punishPolicy) {
        try {
            const message = {
                en: `${admin.full_name} has created a new punish policy ${punishPolicy.id_view}`,
                vi: `${admin.full_name} đã tạo mới chính sách phạt ${punishPolicy.id_view}`,
            }
            const title_admin = `${admin.full_name} đã tạo mới chính sách phạt ${punishPolicy.id_view}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: admin._id,
                title: message,
                body: message,
                title_admin: title_admin,
                type: 'admin_create_punish_policy',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async adminEditPunishPolicy(admin, punishPolicy) {
        try {
            const message = {
                en: `${admin.full_name} has edited punish policy ${punishPolicy.id_view}`,
                vi: `${admin.full_name} đã thay đổi chính sách phạt ${punishPolicy.id_view}`,
            }
            const title_admin = `${admin.full_name} thay đổi chính sách phạt ${punishPolicy.id_view}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: admin._id,
                title: message,
                body: message,
                title_admin: title_admin,
                type: 'admin_edit_punish_policy',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async adminDeletePunishPolicy(admin, punishPolicy) {
        try {
            const message = {
                en: `${admin.full_name} has deleted punish policy ${punishPolicy.id_view}`,
                vi: `${admin.full_name} đã xóa chính sách phạt ${punishPolicy.id_view}`,
            }
            const title_admin = `${admin.full_name} xóa chính sách phạt ${punishPolicy.id_view}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: admin._id,
                title: message,
                body: message,
                title_admin: title_admin,
                type: 'admin_delete_punish_policy',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async adminCreateRewardPolicy(admin, rewardPolicy) {
        try {
            const message = {
                en: `${admin.full_name} has created a new reward policy ${rewardPolicy.id_view}`,
                vi: `${admin.full_name} đã tạo chính sách thưởng ${rewardPolicy.id_view}`,
            }
            const title_admin = `${admin.full_name} đã tạo chính sách thưởng ${rewardPolicy.id_view}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: admin._id,
                title: message,
                body: message,
                title_admin: title_admin,
                type: 'admin_create_reward_policy',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async adminEditRewardPolicy(admin, rewardPolicy) {
        try {
            const message = {
                en: `${admin.full_name} has edited a reward policy ${rewardPolicy.id_view}`,
                vi: `${admin.full_name} đã thay đổi chính sách thưởng ${rewardPolicy.id_view}`,
            }
            const title_admin = `${admin.full_name} đã thay đổi chính sách thưởng ${rewardPolicy.id_view}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: admin._id,
                title: message,
                body: message,
                title_admin: title_admin,
                type: 'admin_edit_reward_policy',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async adminDeleteRewardPolicy(admin, rewardPolicy) {
        try {
            const message = {
                en: `${admin.full_name} has delete a reward policy ${rewardPolicy.id_view}`,
                vi: `${admin.full_name} đã xóa chính sách thưởng ${rewardPolicy.id_view}`,
            }
            const title_admin = `${admin.full_name} đã xóa chính sách thưởng ${rewardPolicy.id_view}`;
            const newItem = new this.historyActivityModel({
                id_admin_action: admin._id,
                title: message,
                body: message,
                title_admin: title_admin,
                type: 'admin_delete_reward_policy',
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async adminCreateRewardTicket(ticket, admin) {
        try {
            const message = {
                en: `${admin.full_name} has created a reward ticket ${ticket.id_view}`,
                vi: `${admin.full_name} đã taọ lệnh thưởng ${ticket.id_view}`,
            }
            const title_admin = `${admin.full_name} đã tạo lệnh thưởng ${ticket.id_view}`;
            this.historyActivityRepositoryService.create({
                id_admin_action: admin._id,
                title: message,
                body: message,
                title_admin: title_admin,
                type: 'admin_create_reward_ticket',
                date_create: new Date(Date.now()).toISOString(),
            })
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async adminDeleteRewardTicket(ticket, admin) {
        try {
            const message = {
                en: `${admin.full_name} has deleted a reward ticket ${ticket.id_view}`,
                vi: `${admin.full_name} đã xóa lệnh thưởng ${ticket.id_view}`,
            }
            const title_admin = `${admin.full_name} đã xóa lệnh thưởng ${ticket.id_view}`;
            this.historyActivityRepositoryService.create({
                id_admin_action: admin._id,
                title: message,
                body: message,
                title_admin: title_admin,
                type: 'admin_delete_reward_ticket',
                date_create: new Date(Date.now()).toISOString(),
            })
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async adminVerifyRewardTicket(ticket, admin) {
        try {
            const message = {
                en: `${admin.full_name} has verified a reward ticket ${ticket.id_view}`,
                vi: `${admin.full_name} đã duyệt lệnh thưởng ${ticket.id_view}`,
            }
            const title_admin = `${admin.full_name} đã duyệt lệnh thưởng ${ticket.id_view}`;
            this.historyActivityRepositoryService.create({
                id_admin_action: admin._id,
                title: message,
                body: message,
                title_admin: title_admin,
                type: 'admin_verify_reward_ticket',
                date_create: new Date(Date.now()).toISOString(),
            })
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async adminUpdateRewardTicket(ticket, admin) {
        try {
            const message = {
                en: `${admin.full_name} has updated a reward ticket ${ticket.id_view}`,
                vi: `${admin.full_name} đã chỉnh sửa lệnh thưởng ${ticket.id_view}`,
            }
            const title_admin = `${admin.full_name} đã chỉnh sửa lệnh thưởng ${ticket.id_view}`;
            this.historyActivityRepositoryService.create({
                id_admin_action: admin._id,
                title: message,
                body: message,
                title_admin: title_admin,
                type: 'admin_edit_reward_ticket',
                date_create: new Date(Date.now()).toISOString(),
            })
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    // async adminCreatePunishTicket(ticket, admin) {
    //     try {
    //         const message = {
    //             en: `admin has create a punish ticket ${ticket.id_view}`,
    //             vi: `admin đã tạo lệnh phạt ${ticket.id_view}`,
    //         }
    //         const title_admin = `${admin._id} đã tạo lệnh phạt ${ticket.id_view}`;
    //         await this.historyActivityRepositoryService.create({
    //             value: ticket.punish_money,
    //             title: message,
    //             body: message,
    //             title_admin: title_admin,
    //             type: 'create_punish_ticket',
    //             date_create: new Date(Date.now()).toISOString(),
    //             id_admin_action: admin._id,
    //             id_punish_ticket: ticket._id,
    //             id_collaborator: ticket.id_collaborator,
    //             id_order: ticket.id_order,
    //             id_customer: ticket.id_customer,
    //         })
    //         return true;
    //     } catch (err) {
    //         throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
    //     }
    // }

    async adminVerifyPunishTicket(ticket, admin) {
        try {
            const message = {
                en: `admin has verified a punish ticket ${ticket.id_view}`,
                vi: `admin đã duyệt lệnh phạt ${ticket.id_view}`,
            }
            const title_admin = `${admin._id} đã duyệt lệnh phạt ${ticket.id_view}`;
            this.historyActivityRepositoryService.create({
                id_admin_action: admin._id,
                title: message,
                body: message,
                title_admin: title_admin,
                type: 'verify_punish_ticket',
                date_create: new Date(Date.now()).toISOString(),
                id_punish_ticket: ticket._id,
                id_collaborator: ticket.id_collaborator,
                id_customer: ticket.id_customer,
            })
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async adminDeletePunishTicket(ticket, admin) {
        try {
            const message = {
                en: `${admin.full_name} has deleted a punish ticket ${ticket.id_view}`,
                vi: `${admin.full_name} đã xóa lệnh phạt ${ticket.id_view}`,
            }
            const title_admin = `${admin.full_name} đã xóa lệnh phạt ${ticket.id_view}`;
            this.historyActivityRepositoryService.create({
                id_admin_action: admin._id,
                title: message,
                body: message,
                title_admin: title_admin,
                type: 'admin_delete_punish_ticket',
                date_create: new Date(Date.now()).toISOString(),
                id_punish_ticket: ticket._id
            })
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }



    async adminChangePunishTicketToWaiting(ticket, admin) {
        try {

            const message = {
                en: `admin has changed a punish ticket ${ticket.id_view}'s status to "waiting"`,
                vi: `admin đã thay đổi trạng thái lệnh phạt ${ticket.id_view} sang "chờ thực thi"`,
            }
            const title_admin = `${admin._id} đã thay đổi trạng thái lệnh phạt ${ticket.id_view} sang "chờ thực thi"`;
            this.historyActivityRepositoryService.create({
                id_admin_action: admin._id,
                id_punish_ticket: ticket._id,
                id_collaborator: ticket.id_collaborator,
                id_customer: ticket.id_customer,
                id_order: ticket.id_order,
                title: message,
                body: message,
                title_admin: title_admin,
                type: 'admin_edit_punish_ticket_status',
                date_create: new Date(Date.now()).toISOString(),
            })
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async adminChangePunishTicketToDoing(ticket, admin) {
        try {
            const message = {
                en: `admin has changed a punish ticket ${ticket.id_view}'s status to "doing"`,
                vi: `admin đã thay đổi trạng thái lệnh phạt ${ticket.id_view} sang "đang thực thi"`,
            }
            const title_admin = `${admin._id} đã thay đổi trạng thái lệnh phạt ${ticket.id_view} sang "đang thực thi"`;
            this.historyActivityRepositoryService.create({
                id_admin_action: admin._id,
                id_punish_ticket: ticket._id,
                id_collaborator: ticket.id_collaborator,
                id_customer: ticket.id_customer,
                id_order: ticket.id_order,
                id_transaction: ticket.id_transaction,
                title: message,
                body: message,
                title_admin: title_admin,
                type: 'admin_edit_punish_ticket_status',
                date_create: new Date(Date.now()).toISOString(),
            })
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async adminRevokeTicket(ticket, admin) {
        try {
            const message = {
                vi: `admin đã thu hồi vé phạt ${ticket.id_view}`,
                en: `admin revoked ticket ${ticket.id_view}`
            };
            const title_admin = `${admin._id} đã thu hồi vé phạt ${ticket.id_view}`;
            await this.historyActivityRepositoryService.create({
                id_admin_action: admin._id,
                id_punish_ticket: ticket._id,
                id_collaborator: ticket.id_collaborator,
                id_customer: ticket.id_customer,
                id_order: ticket.id_order,
                id_transaction: ticket.id_transaction,
                title: message,
                body: message,
                // value: ticket.punish_money,
                title_admin: title_admin,
                type: 'revoke_punish_ticket',
                date_create: new Date(Date.now()).toISOString(),
            })
            return true;
        } catch (err) {
            throw new HttpException(err.reponse || err.toString(), HttpStatus.FORBIDDEN);
        }
    }


    async logPunishCollaboratorAdmin(ticket, punishPolicy, previousBalance, admin) {
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
                id_admin_action: admin._id,
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

}
