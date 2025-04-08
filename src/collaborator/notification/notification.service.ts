import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { ERROR, Order, OrderDocument } from 'src/@core'
import { Notification, NotificationDocument } from 'src/@core/db/schema/notification.schema'
import { iPageNotificationDTOCustomer } from 'src/@core/dto/notification.dto'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'

@Injectable()
export class NotificationService {
    constructor(
        private customExceptionService: CustomExceptionService,
        // private i18n: I18nContext,
        @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    ) { }

    async getNotification(lang, iPage: iPageNotificationDTOCustomer, idUser) {
        try {
            // console.log(user._id, 'user._id')
            const query = {
                $and: [
                {
                    type_notification: iPage.type_notification  
                },
                {
                    // user_object: "collaborator"
                },
                {
                    id_collaborator: idUser
                },
                // {
                //     is_notification: true
                // }
                // {
                //     is_active: true
                // },
                // {
                //     is_delete: false
                // },
                ]
            }

            let query2: any = {
                $and: [
                    {
                        user_object: "collaborator"
                    },
                    {
                        id_collaborator: idUser
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
                .then();
            // let arrNewItem = [];
            // if(iPage.type_notification === "activity") {
            //     const arrFunction = [];
            //     for(const item of arrItem) {
            //         arrFunction.push(this.orderModel.findById(item.related_id))
            //     }
            //     const getPromise = await Promise.all(arrFunction);
            //     for(let i = 0; i < arrItem.length; i++) {
            //         const item = {
            //             title: arrItem[i].title,
            //             description: arrItem[i].description,
            //             date_create: arrItem[i].date_create,
            //             related_id: arrItem[i].related_id,
            //             status: getPromise[i].status,
            //             is_readed: arrItem[i].is_readed,
            //             _id: arrItem[i]._id
            //         };
            //         arrNewItem.push(item)
            //     }
            // } else arrNewItem = arrItem;

            const count = await this.notificationModel.count(query)
            
            const countUnReadAll = await this.notificationModel.count(query2);

            query2.$and.push({ type_notification: "system" });
            const countUnReadSystem = await this.notificationModel.count(query2);

            query2.$and[3].type_notification = "activity";
            const countUnReadActivity  = await this.notificationModel.count(query2);

            const result = {
                start: iPage.start,
                length: iPage.length,
                totalItem: count,
                data: arrItem,
                unRead: {
                    all: countUnReadAll,
                    system: countUnReadSystem,
                    activity: countUnReadActivity
                },
            }
            return result;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    
    async setReaded(lang, idNotification, idUser: string) {
        try {
            const getItem = await this.notificationModel.findById(idNotification);
            if (!getItem || (getItem && getItem.id_collaborator.toString() !== idUser.toString())) {
                throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            }
            getItem.is_readed = true;
            const result = await getItem.save();
            return result;
        } catch (err) {
            throw new HttpException([{ message: err, type: null }], HttpStatus.FORBIDDEN);
        }
    }

    async setAllReaded(lang, typeNotification, idUser: string) {
        try {
            const result = await this.notificationModel.updateMany({
                $and: [
                    {id_collaborator: idUser},
                    {type_notification: typeNotification}
                ]
            }, {is_readed: true});
            // const result = await getItem.save();
            return result;
        } catch (err) {
            throw new HttpException([{ message: err, type: null }], HttpStatus.FORBIDDEN);
        }
    }
    
}
