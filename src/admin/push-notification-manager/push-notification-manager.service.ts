import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Collaborator, CollaboratorDocument, Customer, CustomerDocument, DeviceToken, DeviceTokenDocument, ERROR, iPageDTO } from 'src/@core';
import { GroupOrder, GroupOrderDocument } from 'src/@core/db/schema/group_order.schema';
import { PushNotification, PushNotificationDocument } from 'src/@core/db/schema/push_notification.schema';
import { activePushNotificationDTOAdmin, createPushNotificationDTOAdmin, deletePushNotificationDTOAdmin, editPushNotificationDTOAdmin, iPagePushNotificationDTOAdmin } from 'src/@core/dto/push_notification.dto';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
import { ActivityAdminSystemService } from 'src/core-system/activity-admin-system/activity-admin-system.service';
import { CollaboratorSystemService } from 'src/core-system/collaborator-system/collaborator-system.service';
import { PushNotiSystemService } from 'src/core-system/push-noti-system/push-noti-system.service';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class PushNotificationManagerService {

    constructor(
        private customExceptionService: CustomExceptionService,
        private notificationService: NotificationService,
        private activityAdminSystemService: ActivityAdminSystemService,
        private pushNotiSystemService: PushNotiSystemService,
        private collaboratorSystemService: CollaboratorSystemService,

        @InjectModel(PushNotification.name) private pushNotificationModel: Model<PushNotificationDocument>,
        @InjectModel(DeviceToken.name) private deviceTokenModel: Model<DeviceTokenDocument>,
        @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
        @InjectModel(Collaborator.name) private collaboratorModel: Model<CollaboratorDocument>,
        @InjectModel(GroupOrder.name) private groupOrderModel: Model<GroupOrderDocument>,

    ) { }

    async getListItem(lang, iPage: iPagePushNotificationDTOAdmin) {
        try {
            let query: any = {
                $and: [{
                    $or: [{
                        title: {
                            $regex: iPage.search,
                            $options: "i"
                        }
                    },]
                },
                { is_delete: false }
                ]
            }
            if (iPage.status === "done") {
                query.$and.push({ "campaign_schedule.status": "done" })
            } else if (iPage.status === "todo") {
                query.$and.push({ "campaign_schedule.status": "todo" })
            }
            const arrItem = await this.pushNotificationModel.find(query)
                .skip(iPage.start)
                .limit(iPage.length)
                .sort({ date_create: -1 });
            const count = await this.pushNotificationModel.count(query)
            const result = {
                start: iPage.start,
                length: iPage.length,
                totalItem: count,
                data: arrItem
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async getDetailItem(lang, id: string) {
        try {
            const item = await this.pushNotificationModel.findById(id)
                .populate({ path: 'id_customer', select: { _id: 1, full_name: 1, name: 1, phone: 1, code_phone_area: 1, } })
                .populate({ path: 'id_collaborator', select: { _id: 1, full_name: 1, name: 1, phone: 1, code_phone_area: 1, } })
                .populate({ path: 'id_group_customer', select: { _id: 1, name: 1, } })

            if (!item) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            return item;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async createItem(lang, payload: createPushNotificationDTOAdmin, idAdmin: string) {
        try {

            const newItem = new this.pushNotificationModel({
                title: payload.title,
                body: payload.body,
                image_url: payload.image_url || "",
                is_date_schedule: payload.is_date_schedule,
                date_schedule: payload.date_schedule || null,
                schedule_loop: payload.schedule_loop || "none",
                is_id_collaborator: payload.is_id_collaborator,
                id_collaborator: payload.id_collaborator,
                is_id_customer: payload.is_id_customer,
                id_customer: payload.id_customer,
                is_id_group_customer: payload.is_id_group_customer,
                id_group_customer: payload.id_group_customer,
                date_create: new Date(Date.now()).toISOString(),
                campaign_schedule: []
            });
            const campaign_schedule = {
                status: 'todo',
                date_create: new Date(Date.now()).toISOString(),
                date_schedule: payload.date_schedule || null,
                times: 0
            }
            newItem.campaign_schedule.push(campaign_schedule);
            await newItem.save();

            await this.activityAdminSystemService.createPushNotification(idAdmin, newItem._id);
            return newItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async editItem(lang, payload: editPushNotificationDTOAdmin, id: string, idAdmin: string) {
        try {
            const getItem = await this.pushNotificationModel.findById(id);
            if (!getItem) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            }
            getItem.title = payload.title || getItem.title;
            getItem.body = payload.body || getItem.body;
            getItem.image_url = payload.image_url || getItem.image_url;
            getItem.date_schedule = payload.date_schedule || getItem.date_schedule;
            getItem.schedule_loop = payload.schedule_loop || getItem.schedule_loop;
            getItem.is_id_collaborator = payload.is_id_collaborator || getItem.is_id_collaborator;
            getItem.id_collaborator = payload.id_collaborator || getItem.id_collaborator;
            getItem.is_id_customer = payload.is_id_customer || getItem.is_id_customer;
            getItem.id_customer = payload.id_customer || getItem.id_customer;
            getItem.is_id_group_customer = payload.is_id_group_customer || getItem.is_id_group_customer;
            getItem.id_group_customer = payload.id_group_customer || getItem.id_group_customer;
            getItem.campaign_schedule[0]["status"] = payload.status || getItem.campaign_schedule[0]["status"];
            getItem.campaign_schedule[0]["date_schedule"] = getItem.date_schedule;
            await getItem.save();
            await this.activityAdminSystemService.editPushNotification(idAdmin, getItem._id);
            return getItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async activeNoti(lang, payload: activePushNotificationDTOAdmin, id: string, idAdmin: string) {
        try {
            const getItem = await this.pushNotificationModel.findById(id);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            getItem.is_active = (payload.is_active !== getItem.is_active) ? payload.is_active : getItem.is_active
            await getItem.save();
            await this.activityAdminSystemService.actiPushNotification(idAdmin, getItem._id);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async deletePushNoti(lang, id: string, idAdmin: string) {
        try {
            const getItem = await this.pushNotificationModel.findById(id);
            if (!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.NOT_FOUND);
            getItem.is_delete = true;
            await getItem.save();
            await this.activityAdminSystemService.deletePushNotification(idAdmin, getItem._id);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async testSendNow(lang, payload: any) {
        try {
            // const getAll = await this.deviceTokenModel.find();
            // const arrDeviceToken = [];
            // for (const item of getAll) {
            //     arrDeviceToken.push(item.token);
            // }
            const playload = {
                title: "đây là title",
                body: "đây là body",
                data: {
                },
                token: ['eSqPkAFqQE6bgIPEB-vm2v:APA91bFibeMoQa0hzq_AUM9QLEVYwgAPQG3iVaIPlKNoh3eZ8hzgMf95wGqBICPlICb2LlxDu1uMgDqQ5luguwh060Dh2ngNXCFldnmZQHvNDhOrvf91x2TW4tqEaQoN2Ps42eBvYRCA']
            }
            this.notificationService.send(playload)
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async pushToDevice(payload) {
        try {
            // const getAll = await this.deviceTokenModel.find();
            // const arrDeviceToken = [];
            // for (const item of getAll) {
            //     arrDeviceToken.push(item.token);
            // }
            console.log('payload ', payload);

            const playload = {
                title: "Guvi Guvi",
                body: "Guvi Guvi",
                data: {
                },
                token: [payload.device_token]
            }
            this.notificationService.send(playload)
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
