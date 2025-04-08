import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer, CustomerDocument, ERROR, Order, OrderDocument } from 'src/@core';
import { Notification, NotificationDocument } from 'src/@core/db/schema/notification.schema';
import { iPageNotificationDTOCustomer } from 'src/@core/dto/notification.dto';
import { CustomerRepositoryService } from 'src/@repositories/repository-service/customer-repository/customer-repository.service';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';

@Injectable()
export class NotificationService {
    constructor(
        private customExceptionService: CustomExceptionService,
        private customerRepositoryService: CustomerRepositoryService,
        // private i18n: I18nContext,
        @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    ) { }

    async getNotification(lang, iPage: iPageNotificationDTOCustomer, idUser) {
        try {
            const query = {
                $and: [
                    {
                        type_notification: iPage.type_notification
                    },
                    {
                        user_object: "customer"
                    },
                    {
                        id_customer: idUser
                    },
                    // {
                    //     is_notification: true
                    // }
                ]
            }

            let query2: any = {
                $and: [
                    {
                        user_object: "customer"
                    },
                    {
                        id_customer: idUser
                    },
                    {
                        is_readed: false
                    },
                    // {
                    //     is_notification: true
                    // }
                ]
            }

            const arrItem = await this.notificationModel.find(query).sort({ date_create: -1, _id: 1 })
                .skip(iPage.start)
                .limit(iPage.length)
                // .populate({ path: 'id_promotion', select: { title: 1 } })
                // .populate({ path: 'id_order', select: { title: 1, status: 1 } })
                // .populate({ path: 'id_group_order', select: { title: 1, status: 1 } })
                .then()

            const count = await this.notificationModel.count(query);
            const countUnReadAll = await this.notificationModel.count(query2);
            query2.$and.push({ type_notification: "promotion" });
            const countUnReadPromotion = await this.notificationModel.count(query2);
            query2.$and[3].type_notification = "system";
            const countUnReadSystem = await this.notificationModel.count(query2);
            query2.$and[3].type_notification = "activity";
            const countUnReadActivity = await this.notificationModel.count(query2);
            const result = {
                start: iPage.start,
                length: iPage.length,
                totalItem: count,
                data: arrItem,
                unRead: {
                    all: countUnReadAll,
                    promotion: countUnReadPromotion,
                    system: countUnReadSystem,
                    activity: countUnReadActivity
                },
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    async setReaded(lang, idNotification, idUser: string) {
        try {
            const getItem = await this.notificationModel.findById(idNotification);
            if (!getItem || (getItem && getItem.id_customer.toString() !== idUser.toString())) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            }
            getItem.is_readed = true;
            const result = await getItem.save();
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async setAllReaded(lang, typeNotification, idUser: string) {
        try {
            const getItem = await this.customerRepositoryService.findOneById(idUser);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, "customer")], HttpStatus.BAD_REQUEST);
            await this.notificationModel.updateMany({
                $and: [
                    { id_customer: idUser },
                    { type_notification: typeNotification }
                ]
            }, { is_readed: true });
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
