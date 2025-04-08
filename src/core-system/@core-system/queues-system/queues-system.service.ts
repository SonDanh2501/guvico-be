import { InjectQueue } from '@nestjs/bullmq';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { QueuesService } from 'src/@share-module/queues/service/queues.service';

@Injectable()
export class QueuesSystemService {
    constructor(
        // private queuesService: QueuesService,
        // @InjectQueue('orderQueue') private readonly orderQueue: Queue
    ) { }

    async createOrder(payload) {
        try {
            console.log(payload, 'createOrder');
            // await this.orderQueue.add('orderQueue', payload);
            // await this.queuesService.addToQueueOrder(payload);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async createOrderInQueues(orderData: any) {
        try {
            const nowDate = new Date().toISOString()
            setTimeout(() => {
            console.log(nowDate, ' - Creating order - ', orderData);
            }, 5000);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
        // Xử lý đơn hàng
    }
}
