import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer, CustomerDocument, DeviceToken, DeviceTokenDocument, ERROR, HistoryActivity, HistoryActivityDocument } from 'src/@core';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationSystemService } from '../notification-system/notification-system.service';
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service';
import { CustomerRepositoryService } from 'src/@repositories/repository-service/customer-repository/customer-repository.service';
import { ActivitySystemService } from '../activity-system/activity-system.service';
import { OrderRepositoryService } from 'src/@repositories/repository-service/order-repository/order-repository.service';
import { GroupOrderRepositoryService } from 'src/@repositories/repository-service/group-order-repository/group-order-repository.service';

@Injectable()
export class CustomerSystemService {
    constructor(
        private customExceptionService: CustomExceptionService,
        private notificationService: NotificationService,
        private notificationSystemService: NotificationSystemService,
        private generalHandleService: GeneralHandleService,
        private customerRepositoryService: CustomerRepositoryService,

        private activitySystemService: ActivitySystemService,
        private orderRepositoryService: OrderRepositoryService,
        private groupOrderRepositoryService: GroupOrderRepositoryService,

        @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
        @InjectModel(DeviceToken.name) private deviceTokenModel: Model<DeviceTokenDocument>,
        @InjectModel(HistoryActivity.name) private historyActivityModel: Model<HistoryActivityDocument>,


    ) { }
    async addMoneyReferring(lang, inviter, nameInvite, is_customer, money: number) {
        try {
            console.log(423424);

            const formatMoney = await this.generalHandleService.formatMoney(money);
            const arrDeviceToken = await this.deviceTokenModel.find({ user_id: inviter._id, user_object: is_customer ? "customer" : 'collaborator' })
            if (arrDeviceToken.length > 0) {
                const payload = {
                    title: "GUVI",
                    body: `Bạn "${nameInvite}" của bạn đã hoàn thành đơn hàng đầu tiên. Bạn được nhận thưởng ${formatMoney} vào Ví Gpay.
                    Cùng tải app, cùng chung vui !!! Nhấn đây để xem chi tiết.`,
                    token: [arrDeviceToken[0].token]
                }
                for (let i = 1; i < arrDeviceToken.length; i++) {
                    payload.token.push(arrDeviceToken[i].token)
                }
                this.notificationService.send(payload)
            }
            if (is_customer) {
                inviter.pay_point += money;
            } else {
                inviter.work_wallet += money;
            }
            await inviter.save();
            const title = {
                en: "congratulations give a money",
                vi: "Tặng tiền thành công cho khách hàng"
            }
            const titleAdmin = `Bạn "${nameInvite}" của bạn đã hoàn thành đơn hàng đầu tiên. Bạn được nhận thưởng ${formatMoney} vào Ví Gpay.
            Cùng tải app, cùng chung vui !!! Nhấn đây để xem chi tiết.`;
            const titleAdmin2 = `Cộng tác viên ${inviter._id} Đã được tặng ${formatMoney}`;

            const newGivePayPoint = new this.historyActivityModel({
                id_customer: is_customer ? inviter._id.toString() : null,
                id_collaborator: is_customer ? null : inviter._id.toString(),
                type: is_customer ? "system_give_pay_point_customer" : "system_given_money",
                title: title,
                title_admin: is_customer ? titleAdmin : titleAdmin2,
                body: title,
                date_create: new Date(Date.now()).toISOString(),
                value: money,
                current_pay_point: is_customer ? inviter.pay_point : 0,
                current_work_wallet: is_customer ? 0 : inviter.gift_remainder.toString(),
                status_current_pay_point: is_customer ? 'up' : 'none',
                status_current_work_wallet: is_customer ? 'none' : 'up',
            });
            await newGivePayPoint.save();

            const titleNotification = {
                en: `GUVI`,
                vi: `GUVI`
            }

            const description = {
                en: `Your friend "${nameInvite}" has completed his first order. You will receive a ${formatMoney} reward into your Gpay Wallet.
                Download the app and have fun together!!! Click here to see details`,
                vi: `Bạn "${nameInvite}" của bạn đã hoàn thành đơn hàng đầu tiên. Bạn được nhận thưởng ${formatMoney} vào Ví Gpay.
                Cùng tải app, cùng chung vui !!! Nhấn đây để xem chi tiết.`,
            }

            const payload = {
                title: titleNotification,
                description: description,
                type_notification: is_customer ? 'system' : 'activity',
                user_object: is_customer ? 'customer' : 'collaborator',
                related_id: null,
                id_customer: is_customer ? inviter._id.toString() : null,
                id_collaborator: is_customer ? null : inviter._id.toString(),
            }
            await this.notificationSystemService.newActivity(payload);
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async addMoneyInviterByCustomer(lang, idCustomer, nameInvite: string, money: number) {
        try {
            const getCustomer = await this.customerRepositoryService.findOneById(idCustomer);
            const previousBalance = {
                pay_point: getCustomer.pay_point
            }
            getCustomer.pay_point += money;
            await this.customerRepositoryService.findByIdAndUpdate(idCustomer, getCustomer);
            const title = {
                en: "congratulations give a money",
                vi: "Tặng tiền thành công cho khách hàng"
            }
            const formatMoney = await this.generalHandleService.formatMoney(money);
            const titleAdmin = `Khách hàng ${getCustomer.full_name} Đã được tặng ${formatMoney}`;
            const newItem = new this.historyActivityModel({
                id_customer: getCustomer._id,
                title: title,
                title_admin: titleAdmin,
                body: title,
                type: "system_give_pay_point_customer",
                date_create: new Date(Date.now()).toISOString(),
                value: money,
                current_pay_point: getCustomer.pay_point,
                status_current_pay_point: (previousBalance.pay_point < getCustomer.pay_point) ?
                    "up" : (previousBalance.pay_point > getCustomer.pay_point) ? "down" : "none",
            })
            await newItem.save();
            ///////////////////////////////////////////////
            const titleNotification = {
                en: `Congratulation!!! You have given ${formatMoney}`,
                vi: `Bạn đã được tặng ${formatMoney}`
            }

            const description = {
                en: `Congratulation!!! You have given ${formatMoney} because invite ${nameInvite}`,
                vi: `${nameInvite} đăng ký tài khoản thành công. Bạn được nhận ${formatMoney}`,
            }
            const payload = {
                title: titleNotification,
                description: description,
                type_notification: 'system',
                user_object: 'customer',
                related_id: null,
                id_customer: getCustomer._id,
            }
            await this.notificationSystemService.newActivity(payload);
            ////////////////////////////////////////////////////////////////
            const arrDeviceToken = await this.deviceTokenModel.find({ user_id: getCustomer._id, user_object: "customer" })
            if (arrDeviceToken.length > 0) {
                const payload = {
                    title: "Chúc mừng bạn đã được cộng tiền vào tài khoản",
                    body: `Chúc mừng bạn đã được cộng ${formatMoney} VND vào tài khoản`,
                    token: [arrDeviceToken[0].token]
                }
                for (let i = 1; i < arrDeviceToken.length; i++) {
                    payload.token.push(arrDeviceToken[i].token)
                }
                this.notificationService.send(payload)
            }
        }
        catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async systemGivePayPoint(lang, idCustomer, nameInviter, money: number) {
        try {
            const getCustomer = await this.customerRepositoryService.findOneById(idCustomer);
            const previousBalance = {
                pay_point: getCustomer.pay_point
            }
            getCustomer.pay_point += money;
            await getCustomer.save();
            await this.customerRepositoryService.findByIdAndUpdate(idCustomer, getCustomer);
            const title = {
                en: "congratulations give a money",
                vi: "Tặng tiền thành công cho khách hàng"
            }
            const formatMoney = await this.generalHandleService.formatMoney(money);
            const titleAdmin = `Khách hàng ${getCustomer.full_name} Đã được tặng ${formatMoney} VND`;
            const newItem = new this.historyActivityModel({
                id_customer: getCustomer._id,
                title: title,
                title_admin: titleAdmin,
                body: title,
                type: "system_give_pay_point_customer",
                date_create: new Date(Date.now()).toISOString(),
                value: money,
                current_pay_point: getCustomer.pay_point,
                status_current_pay_point: (previousBalance.pay_point < getCustomer.pay_point) ?
                    "up" : (previousBalance.pay_point > getCustomer.pay_point) ? "down" : "none",
            })
            await newItem.save();
            ///////////////////////////////////////////////////////////////
            const titleNotification = {
                en: `Congratulation!!! You have given ${formatMoney}`,
                vi: `Bạn đã được tặng ${formatMoney}`
            }

            const description = {
                en: `Congratulation!!! You have given ${formatMoney} because invite of ${nameInviter}`,
                vi: `Bạn được tặng ${formatMoney} vì đã nhập mã giới thiệu của ${nameInviter}`,
            }
            const payload = {
                title: titleNotification,
                description: description,
                type_notification: 'system',
                user_object: 'customer',
                related_id: null,
                id_customer: getCustomer._id,
            }
            await this.notificationSystemService.newActivity(payload);
            /////////////////////////////////////////////////////////////
            const arrDeviceToken = await this.deviceTokenModel.find({ user_id: getCustomer._id, user_object: "customer" })
            if (arrDeviceToken.length > 0) {
                const payload = {
                    title: "Chúc mừng bạn đã được cộng tiền vào tài khoản",
                    body: `Chúc mừng bạn đã được cộng ${formatMoney} VND vào tài khoản`,
                    token: [arrDeviceToken[0].token]
                }
                for (let i = 1; i < arrDeviceToken.length; i++) {
                    payload.token.push(arrDeviceToken[i].token)
                }
                this.notificationService.send(payload)
            }
        }
        catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async calReputationSrore(langg, idCustomer, score) {
        try {
            const getCustomer = await this.customerRepositoryService.findOneById(idCustomer);
            if (!getCustomer) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, "customer", null)], HttpStatus.BAD_REQUEST);
            if (getCustomer.reputation_score + score < 101 || getCustomer.reputation_score + score > -1) getCustomer.reputation_score += score
            await this.customerRepositoryService.findByIdAndUpdate(idCustomer, getCustomer);
        }
        catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    // ------------------ NEW FUNCTION ----------------------


    async findItem(lang, idItem) {
        try {
            const getItem = await this.customerRepositoryService.findOneById(idItem);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, 'customer')], HttpStatus.NOT_FOUND);
            return getItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    async refundMoney(lang, subjectAction, idCustomer, money, typeRefund, idGroupOrder, idOrder?) {
        try {
            const getCustomer = await this.customerRepositoryService.findOneById(idCustomer)
            if (typeRefund === 'point') {
                const previousBalance = {
                    pay_point: getCustomer.pay_point
                }
                getCustomer.pay_point += money;
                await this.customerRepositoryService.findByIdAndUpdate(getCustomer._id, getCustomer)
                const payloadDependency = {
                    id_customer: getCustomer._id,
                    id_order: idOrder?._id || null,
                    id_group_order: idGroupOrder
                }
                await this.activitySystemService.refundCustomer(subjectAction, payloadDependency, money)
                const getGroupOrder = await this.groupOrderRepositoryService.findOneById(idGroupOrder)
                if (idOrder) {
                    const getOrder = await this.orderRepositoryService.findOneById(idOrder)
                    this.notificationSystemService.refundCustomer(subjectAction, payloadDependency, money, getGroupOrder, getOrder)
                } else {
                    this.notificationSystemService.refundCustomer(subjectAction, payloadDependency, money, getGroupOrder)
                }
            }
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }



}
