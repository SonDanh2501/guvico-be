import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Cron } from '@nestjs/schedule'
import { endOfDay, startOfDay, subHours } from 'date-fns'
import { Model } from 'mongoose'
import { Collaborator, CollaboratorDocument, Customer, CustomerDocument, DeviceToken, DeviceTokenDocument, InfoRewardCollaborator, InfoRewardCollaboratorDocument, LOOKUP_ID_REWARD_COLLABORATOR, Order, OrderDocument, TEMP_DISCOUNT, TEMP_SERVICE_FEE, TOTAL_COLLABORATOR_FEE, TOTAL_DISCOUNT, TOTAL_EVENTS_FEE, TOTAL_GIFT_REMAINDER, TOTAL_GIVEN_PAY_POINT, TOTAL_GROSS_INCOME, TOTAL_INCOME, TOTAL_NET_INCOME, TOTAL_NET_INCOME_BUSINESS, TOTAL_ORDER, TOTAL_ORDER_FEE, TOTAL_PAY_POINT, TOTAL_PROMOTION_FEE, TOTAL_PUNISH_MONEY, TOTAL_REMAINDER, TOTAL_REWARD_MONEY, TOTAL_SERVICE_FEE, TOTAL_TRANS_MONEY, TransitionCustomer, TransitionCustomerDocument } from 'src/@core'
import { Balance, BalanceDocument } from 'src/@core/db/schema/balance.schema'
import { CollaboratorSetting, CollaboratorSettingDocument } from 'src/@core/db/schema/collaborator_setting.schema'
import { GroupOrder, GroupOrderDocument } from 'src/@core/db/schema/group_order.schema'
import { Punish, PunishDocument } from 'src/@core/db/schema/punish.schema'
import { ReasonCancel, ReasonCancelDocument } from 'src/@core/db/schema/reason_cancel.schema'
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service'
import { PunishManagerService } from 'src/admin/punish-manager/punish-manager.service'
import { RandomReferralCodeSystemService } from 'src/core-system/@core-system/random-referral-code-system/random-referral-code-system.service'
import { ReportSystemService } from 'src/core-system/@core-system/report-system/report-system.service'
import { ActivitySystemService } from 'src/core-system/activity-system/activity-system.service'
import { InviteCodeSystemService } from 'src/core-system/invite-code-system/invite-code-system.service'
import { NotificationSystemService } from 'src/core-system/notification-system/notification-system.service'
import { OrderSystemService } from 'src/core-system/order-system/order-system.service'
import { NotificationService } from 'src/notification/notification.service'

@Injectable()
export class MidnightService {
    constructor(
        private activitySystemService: ActivitySystemService,
        private notificationService: NotificationService,
        private orderSystemService: OrderSystemService,
        private generalHandleService: GeneralHandleService,
        private notificationSystemService: NotificationSystemService,
        private punishManagerService: PunishManagerService,
        private inviteCodeSystemService: InviteCodeSystemService,
        private randomReferralCodeSystemService: RandomReferralCodeSystemService,
        private reportSystemService: ReportSystemService,

        @InjectModel(Collaborator.name) private collaboratorModel: Model<CollaboratorDocument>,
        @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @InjectModel(GroupOrder.name) private groupOrderModel: Model<GroupOrderDocument>,
        @InjectModel(DeviceToken.name) private deviceTokenModel: Model<DeviceTokenDocument>,
        @InjectModel(ReasonCancel.name) private reasonCancelModel: Model<ReasonCancelDocument>,
        @InjectModel(CollaboratorSetting.name) private collaboratorSettingModel: Model<CollaboratorSettingDocument>,
        @InjectModel(Punish.name) private punishModel: Model<PunishDocument>,
        @InjectModel(Balance.name) private balanceModel: Model<BalanceDocument>,
        @InjectModel(TransitionCustomer.name) private transitionCustomerModel: Model<TransitionCustomerDocument>,
        @InjectModel(InfoRewardCollaborator.name) private infoRewardCollaboratorModel: Model<InfoRewardCollaboratorDocument>,
    ) { }

    @Cron('0 0 2 * * *', {
        timeZone: 'Asia/Ho_Chi_Minh'
    })
    async handleCron() {
        // console.log('test time zone ');
        // this.createBalance();
        // this.updateBalance();
        this.randomReferralCodeSystemService.generateRandomReferralCodeList()
        this.reportSystemService.createReportAtMidnight()
    }

    async createBalance() {
        try {
            const total = await this.totalBalance();
            const newItem = new this.balanceModel({
                total_opending_paypoint: total.total_paypoint,
                total_opening_gift_remainder: total.total_gift_remainder,
                total_opening_remainder: total.total_remainder
            });
            await newItem.save();
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async updateBalance() {
        try {
            const lastBalance = await this.balanceModel.findOne().sort({ date_create: -1 });
            if (!lastBalance) return
            const total = await this.totalBalance();
            const current = new Date(lastBalance.date_create);
            const getTimeZoneOffSet = current.getTimezoneOffset();
            let numberSubHour = 5;
            const timeZoneOffSetVN = -420;
            if (getTimeZoneOffSet < 0) {
                const temp = Math.abs(timeZoneOffSetVN) - Math.abs(getTimeZoneOffSet);
                numberSubHour = temp / 60;
            }

            const startDate = subHours(startOfDay(current), numberSubHour).toISOString();
            const endDate = subHours(endOfDay(current), numberSubHour).toISOString();
            const query_punish = {
                $and: [
                    { is_delete: false },
                    { is_verify: true },
                    { date_verify_create: { $gte: startDate } },
                    { date_verify_create: { $lte: endDate } },
                    { status: 'done' }
                ]
            }
            const totalPunish = await this.punishModel.aggregate([
                { $match: query_punish },
                {
                    $group: {
                        _id: {},
                        total_money: TOTAL_PUNISH_MONEY
                    }
                }
            ])
            let total_withdraw_customer = 0;
            let total_top_up_customer = 0;
            let total_withdraw_collaborator = 0;
            let total_top_up_collaborator = 0;
            let total_given_pay_point = 0;
            let total_given_remainder = 0;
            let total_given_gift_remainder = 0;
            let total_pay_point_order_fee = 0;
            let total_cash_order_fee = 0;
            let total_refurn_pay_point_order_fee = 0;
            let total_order_cancel_fee = 0;
            let total_bussiness_income_from_order = 0;
            let total_collaborator_punish_fee = 0;
            const query_custome_trans = {
                $and: [
                    { is_delete: false },
                    { is_verify_money: true },
                    { status: 'done' },
                    {
                        $or: [
                            {
                                $and: [
                                    { date_verify_create: { $gte: startDate } },
                                    { date_verify_create: { $lte: endDate } }
                                ]
                            },
                            {
                                $and: [
                                    { date_verify_created: { $gte: startDate } },
                                    { date_verify_created: { $lte: endDate } }
                                ]
                            }
                        ]
                    },
                    { date_verify_create: { $gte: startDate } },
                    { date_verify_create: { $lte: endDate } },
                ]
            }
            const totalTransCustomer = await this.transitionCustomerModel.aggregate([
                { $match: query_custome_trans },
                {
                    $group: {
                        _id: '$type_transfer',
                        total_money: TOTAL_TRANS_MONEY,
                        total_given_pay_point: TOTAL_GIVEN_PAY_POINT,
                    }
                }
            ])
            for (let item of totalTransCustomer) {
                if (item._id === 'withdraw') {
                    total_withdraw_customer = item.total_money
                }
                if (item._id === 'top_up') {
                    total_top_up_customer = item.total_money;
                    total_given_pay_point = item.total_given_pay_point;
                }

            }
            const query_info_reward = {
                $and: [
                    { is_verify: true },
                    { status: 'done' },
                    { is_delete: false },
                    { date_verify: { $gte: startDate } },
                    { date_verify: { $lte: endDate } },
                ]
            }
            const totalInfoReward = await this.infoRewardCollaboratorModel.aggregate([
                { $match: query_info_reward },
                { $lookup: LOOKUP_ID_REWARD_COLLABORATOR },
                { $unwind: { path: '$id_reward_collaborator', preserveNullAndEmptyArrays: false } },
                {
                    $group: {
                        _id: '$id_reward_collaborator.type_wallet',
                        total_money: TOTAL_REWARD_MONEY
                    }
                }
            ]);
            for (let item of totalInfoReward) {
                if (item._id === 'gift_wallet') {
                    total_given_gift_remainder = item.total_money;
                }
                if (item._id === 'wallet') {
                    total_given_remainder = item.total_money;
                }
            }
            const query_all_order_fee = {
                $and: [
                    { is_delete: false },
                    { status: { $ne: 'cancel' } },
                    { date_create: { $gte: startDate } },
                    { date_create: { $lte: endDate } },
                ]
            }
            const getTotalOrderFee = await this.orderModel.aggregate([
                { $match: query_all_order_fee },
                {
                    $group: {
                        _id: {},
                        total_order_fee: TOTAL_ORDER_FEE,
                    }
                }
            ])
            const getTotalPayPoint = await this.orderModel.aggregate([
                { $match: query_all_order_fee },
                {
                    $group: {
                        _id: '$payment_method',
                        total_order_fee: TOTAL_ORDER_FEE,
                    }
                }
            ])

            for (let item of getTotalPayPoint) {
                if (item._id === 'cash') {
                    total_cash_order_fee = item.total_order_fee
                }
                if (item._id === 'point') {
                    total_pay_point_order_fee = item.total_order_fee
                }

            }
            const query_refurn_order_fee = {
                $and: [
                    { is_delete: false },
                    { status: 'cancel' },
                    {
                        $or: [
                            {
                                $and: [
                                    { id_cancel_customer: { $ne: null } },
                                    { 'id_cancel_customer.date_create': { $gte: startDate } },
                                    { 'id_cancel_customer.date_create': { $lte: endDate } },
                                ]
                            },
                            {
                                $and: [
                                    { id_cancel_user_system: { $ne: null } },
                                    { 'id_cancel_user_system.date_create': { $gte: startDate } },
                                    { 'id_cancel_user_system.date_create': { $lte: endDate } },
                                ]
                            },
                            {
                                $and: [
                                    { id_cancel_system: { $ne: null } },
                                    { 'id_cancel_system.date_create': { $gte: startDate } },
                                    { 'id_cancel_system.date_create': { $lte: endDate } },
                                ]
                            },

                        ]
                    }
                ]
            }
            const getTotalRefurn = await this.orderModel.aggregate([
                { $match: query_refurn_order_fee },
                {
                    $group: {
                        _id: '$payment_method',
                        total_refurn_pay_point_order_fee: TOTAL_ORDER_FEE,
                    }
                }
            ])

            for (let item of getTotalRefurn) {
                if (item._id === 'point') {
                    total_refurn_pay_point_order_fee = item.total_refurn_pay_point_order_fee
                }
                total_order_cancel_fee += item.total_refurn_pay_point_order_fee;
            }
            const query_done_order = {
                $and: [
                    { is_delete: false },
                    { status: 'done' },
                    { date_work: { $gte: startDate } },
                    { date_work: { $lte: endDate } },
                ]
            }
            const getDataDoneOrder = await this.orderModel.aggregate([
                {
                    $match: query_done_order
                },
                {
                    $addFields: TEMP_SERVICE_FEE
                },
                {
                    $addFields: TEMP_DISCOUNT
                },
                {
                    $group: {
                        _id: {},
                        total_order_fee: TOTAL_ORDER_FEE,
                        total_income: TOTAL_INCOME,
                        total_service_fee: TOTAL_SERVICE_FEE,
                        total_collabotator_fee: TOTAL_COLLABORATOR_FEE,
                        total_gross_income: TOTAL_GROSS_INCOME,
                        total_item: TOTAL_ORDER,
                        total_discount: TOTAL_DISCOUNT,
                        total_net_income: TOTAL_NET_INCOME,
                        total_net_income_business: TOTAL_NET_INCOME_BUSINESS,
                        total_event_fee: TOTAL_EVENTS_FEE,
                        total_promotion_fee: TOTAL_PROMOTION_FEE,
                    },
                },
            ]);
            total_bussiness_income_from_order = getDataDoneOrder.length > 0 ? getDataDoneOrder[0].total_net_income_business : 0;
            total_collaborator_punish_fee = totalPunish.length > 0 ? totalPunish[0].total_money : 0
            lastBalance.total_ending_gift_remainder = total.total_gift_remainder;
            lastBalance.total_ending_paypoint = total.total_paypoint;
            lastBalance.total_ending_remainder = total.total_remainder;
            lastBalance.total_collaborator_punish_fee = total_collaborator_punish_fee
            lastBalance.total_top_up_customer = total_top_up_customer;
            lastBalance.total_withdraw_customer = total_withdraw_customer;
            lastBalance.total_withdraw_collaborator = total_withdraw_collaborator;
            lastBalance.total_top_up_collaborator = total_top_up_collaborator;
            lastBalance.total_given_pay_point = total_given_pay_point;
            lastBalance.total_given_gift_remainder = total_given_gift_remainder;
            lastBalance.total_given_remainder = total_given_remainder;
            lastBalance.total_order_fee = getTotalOrderFee.length > 0 ? getTotalOrderFee[0].total_order_fee : 0;
            lastBalance.total_pay_point_order_fee = total_pay_point_order_fee;
            lastBalance.total_cash_order_fee = total_cash_order_fee;
            lastBalance.total_refurn_pay_point_order_fee = total_refurn_pay_point_order_fee;
            lastBalance.total_order_cancel_fee = total_order_cancel_fee;
            lastBalance.total_event_fee = getDataDoneOrder.length > 0 ? getDataDoneOrder[0].total_event_fee : 0;
            lastBalance.total_promotion_fee = getDataDoneOrder.length > 0 ? getDataDoneOrder[0].total_promotion_fee : 0;
            lastBalance.total_collaborator_fee = getDataDoneOrder.length > 0 ? getDataDoneOrder[0].total_collaborator_fee : 0;
            lastBalance.total_bussiness_income_from_order = total_bussiness_income_from_order;
            lastBalance.total_bussiness_net_income = total_bussiness_income_from_order + total_collaborator_punish_fee;
            lastBalance.date_update = new Date(Date.now()).toISOString();

            await lastBalance.save();
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async totalBalance() {
        try {
            const query_collaborator = {
                $and: [
                    { is_verify: true },
                    { is_delete: false }
                ]
            }
            const totalCollaborator = await this.collaboratorModel.aggregate([
                { $match: query_collaborator },
                {
                    $group: {
                        _id: {},
                        total_remainder: TOTAL_REMAINDER,
                        total_gift_remainder: TOTAL_GIFT_REMAINDER
                    }
                }
            ])
            const query_customer = {
                $and: [
                    { is_active: true },
                    { is_delete: false }
                ]
            }
            const totalCustomer = await this.customerModel.aggregate([
                { $match: query_customer },
                {
                    $group: {
                        _id: {},
                        total_pay_point: TOTAL_PAY_POINT,
                    }
                }
            ])
            return {
                total_paypoint: totalCustomer.length > 0 ? totalCustomer[0].total_pay_point : 0,
                total_remainder: totalCollaborator.length > 0 ? totalCollaborator[0].total_remainder : 0,
                total_gift_remainder: totalCollaborator.length > 0 ? totalCollaborator[0].total_gift_remainder : 0
            }
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }
}
