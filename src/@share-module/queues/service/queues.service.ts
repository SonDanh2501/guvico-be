import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class QueuesService {
    constructor(
        @InjectQueue('orderQueue') private readonly orderQueue: Queue
    ) { }
    onModuleInit() {
        this.initializeQueues();
    }

    private async initializeQueues() {
        // await this.orderQueue.drain(); // Xóa tất cả các công việc cũ
    }

    async addToQueue(orderData: any) {
        await this.orderQueue.add('order', orderData);
    }


    async addToQueueOrder(orderData: any) {
        console.log(orderData, 'orderData');
        const result = await this.orderQueue.add('order', orderData);
    }
}
