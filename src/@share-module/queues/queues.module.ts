import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { CoreSystemModule2 } from 'src/core-system/@core-system/core-system.module';
import { QueuesService } from './service/queues.service';
import { join } from 'path';
// import { CONFIG_REDIS } from 'src/@core';
import { QueuesStackModule } from './queues-stack.module';
const CONFIG_REDIS = {
    host: "localhost",
    port: 6379
}


@Global()
@Module({
    imports: [
        QueuesStackModule
    ],
    providers: [
        QueuesService,
        // CreateOrderQueueService
    ],
    exports: [
        // CreateOrderQueueService,
        QueuesService
    ]
})
export class QueuesModule { }
