import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { add, sub } from 'date-fns'
import { Model } from 'mongoose'
import { Collaborator, CollaboratorDocument, DeviceToken, DeviceTokenDocument, ERROR, HistoryActivity, HistoryActivityDocument, Order, OrderDocument } from 'src/@core'
import { GroupOrderDocument } from 'src/@core/db/schema/group_order.schema'
import { CollaboratorRepositoryService } from 'src/@repositories/repository-service/collaborator-repository/collaborator-repository.service'
import { OrderRepositoryService } from 'src/@repositories/repository-service/order-repository/order-repository.service'
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service'
import { GeneralHandleService } from 'src/@share-module/general-handle/general-handle.service'
import { NotificationService } from 'src/notification/notification.service'
import { ActivityCollaboratorSystemService } from '../activity-collaborator-system/activity-collaborator-system.service'
import { ActivitySystemService } from '../activity-system/activity-system.service'
import { NotificationSystemService } from '../notification-system/notification-system.service'
@Injectable()
export class CollaboratorSystemService {
    constructor(
        private customExceptionService: CustomExceptionService,
        private generalHandleService: GeneralHandleService,
        private notificationService: NotificationService,
        private notificationSystemService: NotificationSystemService,
        private activityCollaboratorSystemService: ActivityCollaboratorSystemService,
        private collaboratorRepositoryService: CollaboratorRepositoryService,
        private activitySystemService: ActivitySystemService,
        private orderRepositoryService: OrderRepositoryService,

        //private activityAdminSystemService: ActivityAdminSystemService,

        @InjectModel(Collaborator.name) private collaboratorModel: Model<CollaboratorDocument>,
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @InjectModel(HistoryActivity.name) private historyActivityModel: Model<HistoryActivityDocument>,
        @InjectModel(DeviceToken.name) private deviceTokenModel: Model<DeviceTokenDocument>,

        // @InjectModel(GroupOrder.name) private groupOrderModel: Model<GroupOrderDocument>,
    ) { }

    async calculateBalance(lang, collaborator, money) {
        try {
            let tempRemainder = 0;
            tempRemainder = collaborator.gift_remainder - money;
            if (tempRemainder < 0) {
                const tempRemainderAbs = Math.abs(tempRemainder);
                if (collaborator.remainder < tempRemainderAbs) throw new HttpException([await this.customExceptionService.i18nError(ERROR.COLLABORATOR_NOT_ENOUGH_REMAINDER, lang, null)], HttpStatus.NOT_FOUND);
                collaborator.remainder = collaborator.remainder - tempRemainderAbs;
                collaborator.gift_remainder = 0;
            } else {
                collaborator.gift_remainder = tempRemainder;
            }
            const result = {
                remainder: collaborator.remainder,
                gift_remainder: collaborator.gift_remainder
            }
            return result;


        } catch (err) {
            // this.logger.error(err.response || err.toString());
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async checkBalanceMiniusOrder(lang, collaborator, groupOrder, order) {
        try {
            let tempRemainder = 0;
            tempRemainder = collaborator.gift_remainder - order.platform_fee;
            if (groupOrder.payment_method === "cash") {
                tempRemainder = tempRemainder - order.pending_money;
            }
            if (tempRemainder < 0) {
                const tempRemainderAbs = Math.abs(tempRemainder);
                if (collaborator.remainder < tempRemainderAbs) throw new HttpException([await this.customExceptionService.i18nError(ERROR.COLLABORATOR_NOT_ENOUGH_REMAINDER, lang, null)], HttpStatus.BAD_REQUEST);
            }
            return true;
        } catch (err) {
            // this.logger.error(err.response || err.toString());
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    async checkCollaborator(lang, idCollaborator, infoJob, pending_money) {
        try {
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(idCollaborator);
            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, null)], HttpStatus.BAD_REQUEST);
            if (getCollaborator.is_lock_time === true) {
                const dateNow = new Date(Date.now()).getTime();
                const dateLock = new Date(getCollaborator.lock_time).getTime();
                if (dateNow < dateLock) {
                    const time = await this.generalHandleService.convertMsToTime(dateLock - dateNow);
                    const property = {
                        property: time
                    }
                    throw new HttpException([await this.customExceptionService.i18nErrorWithProperty(ERROR.COLLABORATOR.IS_LOCK_TIME, lang, property, null)], HttpStatus.NOT_FOUND);
                } else {
                    getCollaborator.is_lock_time = false;
                    getCollaborator.lock_time = null;
                    getCollaborator.save();
                }
            }
            ///////////////////////////////////////// check xem co trung gio khong ///////////////////////////////////////////////
            const total_minutes_estimate = infoJob.total_estimate * 60 * 60 * 1000
            for (let item of infoJob.date_work_schedule) {
                const end_date_work = new Date(new Date(item.date).getTime() + (total_minutes_estimate)).toISOString();
                const checkTimeStart = sub(new Date(item.date), { minutes: 30 }).toISOString();
                const checkTimeEnd = add(new Date(end_date_work), { minutes: 30 }).toISOString();
                const queryOrder = {
                    $and: [
                        { id_collaborator: getCollaborator._id },
                        { status: { $in: ['confirm', 'doing'] } },
                        {
                            $or: [
                                { date_work: { $gt: checkTimeStart, $lt: checkTimeEnd } },
                                { end_date_work: { $gt: checkTimeStart, $lt: checkTimeEnd } },
                            ]
                        }
                    ]
                }
                const getOrder = await this.orderModel.find(queryOrder);
                if (getOrder.length > 0) throw new HttpException([await this.customExceptionService.i18nError(ERROR.TIME_OVERLAP, lang, null)], HttpStatus.BAD_REQUEST);
            }
            ///////////////////////////////////////// check xem co trung gio khong ///////////////////////////////////////////////
            let tempRemainder = 0;
            // const collaborator = await this.collaboratorModel.findById(id_collaborator);
            tempRemainder = getCollaborator.work_wallet - infoJob.date_work_schedule[0].platform_fee;
            // if (newGroupOrder.payment_method === "cash") {
            tempRemainder = tempRemainder - pending_money;
            // }
            if (tempRemainder < 0) {
                const tempRemainderAbs = Math.abs(tempRemainder);
                if (getCollaborator.remainder < tempRemainderAbs) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ADMIN_COLLABORATOR_NOT_ENOUGH_REMAINDER, lang, null)], HttpStatus.NOT_FOUND);
            }
            ///////////////////////////////////////// check xem so du co du khong ///////////////////////////////////////////////

            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);;
        }
    }

    async addMoneyReferingByCollaborator(lang, idCollaborator: string, nameInvite: string, money: number) {
        try {
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(idCollaborator)
            const title = {
                en: "congratulations give a money",
                vi: "Tặng tiền thành công cho cộng tác viên"
            }
            const formatMoney = await this.generalHandleService.formatMoney(money);
            const titleAdmin = `Cộng tác viên ${getCollaborator.full_name} Đã được tặng ${formatMoney} VND`;
            const previousBalance = {
                gift_remainder: getCollaborator.gift_remainder,
                remainder: getCollaborator.remainder,
                collaborator_wallet: getCollaborator.collaborator_wallet,
                work_wallet: getCollaborator.work_wallet,
            }
            getCollaborator.gift_remainder += money;
            getCollaborator.work_wallet += money;

            await getCollaborator.save();
            const newItem = new this.historyActivityModel({
                id_collaborator: getCollaborator._id,
                title: title,
                title_admin: titleAdmin,
                body: title,
                type: "system_given_money",
                date_create: new Date(Date.now()).toISOString(),
                value: money,
                current_remainder: getCollaborator.remainder,
                status_current_remainder: (previousBalance.remainder < getCollaborator.remainder) ?
                    "up" : (previousBalance.remainder > getCollaborator.remainder) ? "down" : "none",
                current_gift_remainder: getCollaborator.gift_remainder,
                status_current_gift_remainder: (previousBalance.gift_remainder < getCollaborator.gift_remainder) ?
                    "up" : (previousBalance.gift_remainder > getCollaborator.gift_remainder) ? "down" : "none",
                current_collaborator_wallet: getCollaborator.collaborator_wallet,
                status_current_collaborator_wallet: (previousBalance.collaborator_wallet < getCollaborator.collaborator_wallet) ?
                    "up" : (previousBalance.collaborator_wallet > getCollaborator.collaborator_wallet) ? "down" : "none",
                current_work_wallet: getCollaborator.work_wallet,
                status_current_work_wallet: (previousBalance.work_wallet < getCollaborator.work_wallet) ?
                    "up" : (previousBalance.work_wallet > getCollaborator.work_wallet) ? "down" : "none",
            })
            const titleNotification = {
                en: `Congratulation!!! You have given ${formatMoney}`,
                vi: `Bạn đã được tặng ${formatMoney}`
            }
            await newItem.save();
            const description = {
                en: `Congratulation!!! You have given ${formatMoney} because invite ${nameInvite}`,
                vi: `Bạn được tặng ${formatMoney} vì đã giới thiệu ${nameInvite}`,
            }
            const payload = {
                title: titleNotification,
                description: description,
                type_notification: 'activity',
                user_object: 'collaborator',
                related_id: null,
                id_collaborator: getCollaborator._id,
            }
            await this.notificationSystemService.newActivity(payload);

            const arrDeviceToken = await this.deviceTokenModel.find({ user_id: getCollaborator._id, user_object: "collaborator" })
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
    /**
     * 
     * @param groupOrder document mongo của group order
     * @returns Trả về danh sách CTV trong khu vực quận đó, danh sách này bỏ ra các CTV yêu thích
     * các CTV bị chặn type return string[]
     */
    async collaboratorInDistrict(groupOrder: GroupOrderDocument) {
        // tìm kiếm các CTV đăng ký làm việc trong quận dựa theo đơn hàng
        try {
            const query = {
                $and: [
                    { is_delete: false },
                    { is_verify: true },
                    { is_active: true },
                    { is_locked: false },
                    { district: groupOrder.district },
                    { city: groupOrder.city },
                    { _id: { $nin: groupOrder.id_favourite_collaborator } },
                    { _id: { $nin: groupOrder.id_block_collaborator } },
                ]
            }
            const getCollaborator = await this.collaboratorModel.find(query).select({ _id: 1 });
            const resultArr = [];
            for (let item of getCollaborator) {
                resultArr.push(item._id.toString());
            }
            return resultArr;
        }
        catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async collaboratorFavourite(groupOrder: GroupOrderDocument) {
        try {
            const query = {
                $and: [
                    { is_delete: false },
                    { is_verify: true },
                    { is_active: true },
                    { is_locked: false },
                    { _id: { $in: groupOrder.id_favourite_collaborator } },
                ]
            }
            const resultArr = []
            const getCollaborator = await this.collaboratorModel.find(query).select({ _id: 1 });
            for (let item of getCollaborator) {
                resultArr.push(item._id.toString());
            }
            return resultArr;
        }
        catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async collaboratorInCity(groupOrder: GroupOrderDocument) {
        // tìm kiếm các CTV đăng ký trong thành phố nhưng loại trừ 
        //CTV yêu thích và hạn chế của đơn hàng và loại bỏ cả các CTV đăng ký trong khu vực quận 
        try {
            const query = {
                $and: [
                    { is_delete: false },
                    { is_verify: true },
                    { is_active: true },
                    { is_locked: false },
                    { city: groupOrder.city },
                    { district: { $ne: groupOrder.district } },
                    { _id: { $nin: groupOrder.id_favourite_collaborator } },
                    { _id: { $nin: groupOrder.id_block_collaborator } },
                ]
            }
            const getCollaborator = await this.collaboratorModel.find(query).select({ _id: 1 });
            const resultArr = [];
            for (let item of getCollaborator) {
                resultArr.push(item._id.toString());
            }
            return resultArr;
        }
        catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    // ko sài ở bản sau nữa nữa
    async changeMoneyWallet(collaborator: CollaboratorDocument, money: number, is_balance_money?: boolean, isPunishTicket: boolean = false) {
        try {
            const previousBalance = {
                work_wallet: collaborator.work_wallet,
                collaborator_wallet: collaborator.collaborator_wallet,
            }
            let tempMoney = collaborator.collaborator_wallet - Math.abs(money);
            // if (tempMoney < 0 && !isPunishTicket) throw new HttpException([await this.customExceptionService.i18nError(ERROR.COLLABORATOR_NOT_ENOUGH_REMAINDER, 'vi', null)], HttpStatus.BAD_REQUEST);
            if(tempMoney < 0) {
                collaborator.work_wallet += collaborator.collaborator_wallet
                collaborator.collaborator_wallet = 0
            } else {
                collaborator.work_wallet += Math.abs(money);
                collaborator.collaborator_wallet = tempMoney;
            }
            await collaborator.save();
            if (is_balance_money === true) {
                this.activityCollaboratorSystemService.balanceMoney(collaborator._id, Math.abs(money), previousBalance);
            } else {
                this.activityCollaboratorSystemService.collaboratorChangeMoneyWallet(collaborator._id, Math.abs(money), previousBalance)
            }
            return collaborator;
        } catch (err) {

            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async findCollaboratorById(id: string) {
        try {
            const collaborator = await this.collaboratorRepositoryService.findOneById(id);
            if (!collaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, 'vi', null)], HttpStatus.NOT_FOUND);
            return collaborator;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async resetCollaborator(id: string) {
        try {
            const collaborator = await this.collaboratorRepositoryService.findOneById(id);
            if (!collaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, 'vi', null)], HttpStatus.NOT_FOUND);
            collaborator.gift_remainder = 100000;
            collaborator.remainder = 100000;
            collaborator.work_wallet = 100000;
            collaborator.collaborator_wallet = 100000;
            await this.collaboratorRepositoryService.findByIdAndUpdate(id, collaborator);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async balanceMoney(lang, idCollaborator: string, isPunishTicket: boolean = false) {
        try {
            const getCollaborator = await this.findCollaboratorById(idCollaborator);
            if (!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, 'vi', 'collaborator')], HttpStatus.NOT_FOUND);
            if (getCollaborator.work_wallet < 0) {
                if (getCollaborator.collaborator_wallet === 0) return true;
                let gapMoney = Math.abs(getCollaborator.work_wallet);
                if (gapMoney < getCollaborator.collaborator_wallet) {
                    const collab = await this.changeMoneyWallet(getCollaborator, gapMoney, true, isPunishTicket);
                    getCollaborator.work_wallet = collab.work_wallet;
                    getCollaborator.collaborator_wallet = collab.collaborator_wallet;
                } else {
                    const collab = await this.changeMoneyWallet(getCollaborator, getCollaborator.collaborator_wallet, true, isPunishTicket);
                    getCollaborator.work_wallet = collab.work_wallet;
                    getCollaborator.collaborator_wallet = collab.collaborator_wallet;
                }
            } else return true;
            await getCollaborator.save();
            return true;
        } catch (err) {
            console.log(err, "error");
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }



    async findOneByIdRedis(lang, id) {
        try {
            const item = await this.collaboratorRepositoryService.findOneById(id);
            return item;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }


    // ------------------ NEW FUNCTION ----------------------


    async findItem(lang, idItem) {
        try {
            const getItem = await this.collaboratorRepositoryService.findOneById(idItem);
            if(!getItem) throw new HttpException([await this.customExceptionService.i18nError(ERROR.ITEM_NOT_FOUND, lang, 'collaborator')], HttpStatus.NOT_FOUND);
            return getItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async refundMoney(lang, subjectAction, idCollaborator, money, type_wallet_refund, idGroupOrder, getOrder) {
        try {
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(idCollaborator);

            const previousBalance = {
                work_wallet: getCollaborator.work_wallet,
                collaborator_wallet: getCollaborator.collaborator_wallet
            }
            

            if (type_wallet_refund === 'collaborator_wallet') {
                getCollaborator.collaborator_wallet += money
            } else {
                getCollaborator.work_wallet += money
            }
            await this.collaboratorRepositoryService.findByIdAndUpdate(getCollaborator._id, getCollaborator)

            const payloadDependency = {
                id_collaborator: getCollaborator._id,
                id_order: getOrder._id,
                id_group_order: idGroupOrder
            }
            // const getOrder = await this.orderRepositoryService.findOneById(idOrder);
            await this.activitySystemService.refundCollaborator(subjectAction, payloadDependency, money, previousBalance)
            this.notificationSystemService.refundCollaborator(subjectAction, payloadDependency, money, getOrder)

            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async minusPlatformFee(lang, subjectAction, typeWallet, idCollaborator, idOrder, money) {
        try {
            const getCollaborator = await this.collaboratorRepositoryService.findOneById(idCollaborator);
            const getOrder = await this.orderRepositoryService.findOneById(idOrder)
            if(!getCollaborator) throw new HttpException([await this.customExceptionService.i18nError(ERROR.USER_NOT_FOUND, lang, 'collaborator')], HttpStatus.NOT_FOUND);
            
            const previousBalance = {
                work_wallet: getCollaborator.work_wallet,
                collaborator_wallet: getCollaborator.collaborator_wallet
            }

            getCollaborator[typeWallet] -= money;

            await this.collaboratorRepositoryService.findByIdAndUpdate(getCollaborator._id, getCollaborator);

            const payloadDependency = {
                id_collaborator: getCollaborator._id,
                id_order: getOrder._id,
                id_group_order: getOrder.id_group_order
            }
            await this.activitySystemService.minusPlatformFee(subjectAction, payloadDependency, money, previousBalance)
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}