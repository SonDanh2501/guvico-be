import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { join } from 'path';

const CONFIG_REDIS = {
    host: "localhost",
    port: 6379
}
// @Global() // Nếu bạn muốn module này được sử dụng toàn cục
@Module({
    imports: [
        BullModule.forRoot({
            connection: {
                host: CONFIG_REDIS.host,
                port: CONFIG_REDIS.port
            },
        }),
        BullModule.registerQueue(
            {
                name: "orderQueue",
                connection: {
                    host: CONFIG_REDIS.host,
                    port: CONFIG_REDIS.port
                },
                processors: [{
                    concurrency: 1,
                    path: join(__dirname, '/sandbox-processor/order.processor.js'),
                }]
            },
        ),
        // QueuesStackModule,

        // CoreSystemModule2
    ],
    providers: [
    ],
    exports: [
        BullModule,
    ]
})
export class QueuesStackModule { }
