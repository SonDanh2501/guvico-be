import { HttpException, HttpStatus, Injectable, OnModuleInit } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Cron, CronExpression } from '@nestjs/schedule'
import { Model } from 'mongoose'
import * as os from 'os'
import { io, Socket } from 'socket.io-client'
import { CURRENT_SERVER_GATEWAY } from 'src/@core'
import { NotificationSystemService } from 'src/core-system/@core-system/notification-system/notification-system.service'
import { PushNotificationSystemService } from 'src/core-system/@core-system/push-notification-system/push-notification-system.service'
import { NotificationService } from 'src/notification/notification.service'
import { Customer, CustomerDocument } from '../../@core/db/schema/customer.schema'
import { DeviceToken, DeviceTokenDocument } from '../../@core/db/schema/device_tokens.schema'
import { PushNotification, PushNotificationDocument } from '../../@core/db/schema/push_notification.schema'
import { OrderSchedulerService } from '../order-scheduler/order-scheduler.service'
import { PromotionSchedulerService } from '../promotion-scheduler/promotion-scheduler.service'

@Injectable()
export class PushNotificationService implements OnModuleInit {
    private socket: Socket;

    constructor(
        private promotionSchedulerService: PromotionSchedulerService,
        private orderSchedulerService: OrderSchedulerService,
        private pushNotificationSystemService: PushNotificationSystemService,
        private notificationSystemService: NotificationSystemService,

        @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
        @InjectModel(PushNotification.name) private pushNotificationModel: Model<PushNotificationDocument>,
        @InjectModel(DeviceToken.name) private deviceTokenModel: Model<DeviceTokenDocument>,

        private notificationService: NotificationService
    ) { }

    onModuleInit() {
        // Kết nối tới server Socket.IO qua domain hoặc IP
        this.socket = io(`${CURRENT_SERVER_GATEWAY}/gateway/admin`, {
            extraHeaders: {
                iscronjob: 'iscronjob'
            },
            transports: ['websocket'],  // Sử dụng WebSocket
        });

        // Xử lý sự kiện khi kết nối thành công
        this.socket.on('connect', () => {
            console.log('Cronjob connected to Socket.IO server');
        });

        // Xử lý khi kết nối bị ngắt
        this.socket.on('disconnect', () => {
            console.log('Cronjob disconnected from Socket.IO server');
        });
    }

    @Cron('10 * * * * *')
    handleCron() {
        this.processPushNotification();
        this.promotionSchedulerService.turnOnLoopPromotion();
        this.orderSchedulerService.systemReviewOrder();
        this.orderSchedulerService.autoCheckReview();
    }
    async processPushNotification() {
        try {
            const getPushNotification = await this.pushNotificationModel.find({
                is_delete: false,
                is_active: true,
                "campaign_schedule.status": 'todo'
            });
            for (let item of getPushNotification) {
                if (item.is_date_schedule === true) {
                    const currentDate = new Date(Date.now()).toISOString();
                    const check = new Date(currentDate).getTime() - new Date(item.date_schedule).getTime() > 0 ? true : false;
                    if (check) {

                        item.campaign_schedule[0]["status"] = "done";
                        item.campaign_schedule[0]["date_schedule"] = new Date(Date.now()).toISOString();
                        await item.save();

                        if (item.is_id_group_customer) {
                            this.pushNotiGroupCustomer(item);
                        }
                        if (item.is_id_customer) {
                            this.pushNotiCustomer(item);
                        }
                        if (item.is_id_customer == false && item.is_id_group_customer == false) {
                            this.pushNotiAllCustomer(item);
                        }
                    }
                } else {
                    item.campaign_schedule[0]["status"] = "done";
                    item.campaign_schedule[0]["date_schedule"] = new Date(Date.now()).toISOString();
                    await item.save();
                    if (item.is_id_group_customer) {
                        this.pushNotiGroupCustomer(item);
                    }
                    if (item.is_id_customer) {
                        this.pushNotiCustomer(item);
                    }
                    if (item.is_id_customer == false && item.is_id_group_customer == false) {
                        this.pushNotiAllCustomer(item);
                    }
                }
            }
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }

    }

    async pushNotiGroupCustomer(pushNotification) {
        try {
            let payload = {
                title: pushNotification.title,
                body: pushNotification.body,
                image_url: pushNotification.image_url,
                token: []
            }
            let arrIdCustomer = [];
            let tem = 0;
            for (let id_group_customer of pushNotification.id_group_customer) {
                const getId = await this.customerModel.find({
                    $and: [
                        { is_delete: false },
                        { id_group_customer: id_group_customer.toString() }
                    ]
                }).select({ _id: 1 })
                tem += getId.length
                for (let i of getId) {
                    arrIdCustomer.push(i._id.toString());
                }
            }
            arrIdCustomer = await this.fillterId(arrIdCustomer);
            let countDevice = 0;
            let start = 0;
            let subArrIdCustomer = [];
            do {
                const temp = arrIdCustomer.slice(start, start + 200)
                subArrIdCustomer.push(temp)
                start += 200;
            } while (start < arrIdCustomer.length)
            for (let itemIdCustomer of subArrIdCustomer) {
                const getDeviceToken = await this.deviceTokenModel.find({ user_id: { $in: itemIdCustomer }, user_object: 'customer' })
                    .select({ token: 1 });
                let arrDeviceToken = []
                for (let itemToken of getDeviceToken) {
                    await arrDeviceToken.push(itemToken.token);
                }
                payload.token = arrDeviceToken;
                if (payload.token.length > 0) {
                    this.notificationService.send(payload);
                }
                countDevice += payload.token.length;
            }
            pushNotification.campaign_schedule[0]["times"] = countDevice;
            // pushNotification.campaign_schedule[0]["status"] = "done";
            // pushNotification.campaign_schedule[0]["date_schedule"] = new Date(Date.now()).toISOString();
            await pushNotification.save();

        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async pushNotiCustomer(pushNotification) {
        try {
            let payload = {
                title: pushNotification.title,
                body: pushNotification.body,
                image_url: pushNotification.image_url,
                token: []
            }
            let myCount = 0;
            for (let idCustomer of pushNotification.id_customer) {
                const getDeviceToken = await this.deviceTokenModel.find({ user_id: idCustomer, user_object: 'customer' });
                let arrDeviceToken = []
                for (let item of getDeviceToken) {
                    arrDeviceToken.push(item.token);
                }
                payload.token = arrDeviceToken;
                if (payload.token.length > 0) {
                    myCount += payload.token.length;
                    this.notificationService.send(payload);
                }
            }
            pushNotification.campaign_schedule[0]["times"] = myCount;
            // pushNotification.campaign_schedule[0]["status"] = "done";
            // pushNotification.campaign_schedule[0]["date_schedule"] = new Date(Date.now()).toISOString();
            await pushNotification.save();

        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async fillterId(arr) {
        let tempArr = [];
        arr.forEach((element) => {
            if (!tempArr.includes(element)) {
                tempArr.push(element);
            }
        });
        return tempArr;
    }

    async pushNotiAllCustomer(pushNotification) {
        try {
            let payload = {
                title: pushNotification.title,
                body: pushNotification.body,
                image_url: pushNotification.image_url,
                token: [],
                soundGuvi: true
            }
            let arrIdCustomer = [];
            let tem = 0;
            const getId = await this.customerModel.find({
                $and: [
                    { is_delete: false },
                ]
            }).select({ _id: 1 })
            tem += getId.length
            for (let i of getId) {
                arrIdCustomer.push(i._id.toString());
            }
            arrIdCustomer = await this.fillterId(arrIdCustomer);
            let countDevice = 0;
            let start = 0;
            let subArrIdCustomer = [];
            do {
                const temp = arrIdCustomer.slice(start, start + 200)
                subArrIdCustomer.push(temp)
                start += 200;
            } while (start < arrIdCustomer.length)
            for (let itemIdCustomer of subArrIdCustomer) {
                const getDeviceToken = await this.deviceTokenModel.find({ user_id: { $in: itemIdCustomer }, user_object: 'customer' })
                    .select({ token: 1 });
                let arrDeviceToken = []
                for (let itemToken of getDeviceToken) {
                    await arrDeviceToken.push(itemToken.token);
                }
                payload.token = arrDeviceToken;
                if (payload.token.length > 0) {
                    this.notificationService.send(payload);
                }
                countDevice += payload.token.length;
            }
            pushNotification.campaign_schedule[0]["times"] = countDevice;
            // pushNotification.campaign_schedule[0]["status"] = "done";
            // pushNotification.campaign_schedule[0]["date_schedule"] = new Date(Date.now()).toISOString();
            await pushNotification.save();

        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    // @Cron(CronExpression.EVERY_SECOND)
    // async runEvery1Second () {
    //     this.pushNotificationSystemService.totalMessageCount = 0;
    //     this.pushNotificationSystemService.processMessageQueue();
    // }

    @Cron('*/3 * * * * *')
    async runEvery3Second() {
        await this.notificationSystemService.updateFailStatusForManyNotiUsingSocket();
    }

    @Cron(CronExpression.EVERY_5_SECONDS)
    async runEvery5Seconds() {
        this.emitEventForServerGateway()
        this.pushNotificationSystemService.sendNotificationUsingFirebase()
        // const getCpuUsage = await this.getCpuUsage()
        // console.log(getCpuUsage);
        
    }

    @Cron(CronExpression.EVERY_10_MINUTES)
    async runEvery10Mins() {
        this.notificationSystemService.createListNotificationBySchedule()
    }

    @Cron(CronExpression.EVERY_MINUTE)
    async runEvery1Min() {
        const getCpuUsage = await this.getCpuUsage()
        console.log(getCpuUsage);   
    }

    // @Cron("0 */2 * * * *")
    // async runEvery2Mins() {
    //     this.notificationSystemService.updateFailStatusForManyNotiUsingFirebase()
    // }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async runEveryAtMidnight() {
        await this.notificationSystemService.deleteManyNotificationSchedule()
    }

    emitEventForServerGateway() {
        if (this.socket.connected) {
            this.socket.emit('cronjobForCustomerToServer'); // Phat su kien 'cronjobToServer' toi server
            this.socket.emit('cronjobForCollaboratorToServer'); // Phat su kien 'cronjobToServer' toi server
        } else {
            console.error('Socket.IO server not connected with cronjob');
            //  // Kết nối tới server Socket.IO qua domain hoặc IP
            // this.socket = io(`${CURRENT_SERVER_GATEWAY}/gateway/admin`, {
            //     extraHeaders: {
            //         iscronjob: 'iscronjob',
            //     }, 
            //     transports: ['websocket'],  // Sử dụng WebSocket
            // });

            // // // Xử lý sự kiện khi kết nối thành công
            // this.socket.on('connect', () => {
            //     console.log('Cronjob connected to Socket.IO server');
            // });
        }
    }

    async getCpuUsage() {
        const cpus = os.cpus()
        let idleMs = 0;
        let totalMs = 0;
        
        cpus.forEach((cpu) => {
            console.log(cpu);
            
        });
        
        // let usagePercentage = ((totalMs - idleMs) / totalMs) * 100
        return true
    }
}
