import { Module } from '@nestjs/common';
import { BullModule, RegisterQueueOptions } from '@nestjs/bullmq';
import { join } from 'path';
import { CoreSystemModule } from 'src/core-system/core-system.module';
import { CreateOrderQueueService } from './create-order-queue/create-order-queue.service';
import { CONFIG_REDIS } from 'src/@core';

// const configRedis = {
//   host: "server.guvico.com",
//   port: 6377
// }

const configRedis = {
  host: "45.251.112.75",
  port: 6379
}


@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: CONFIG_REDIS.host,
        port: CONFIG_REDIS.port
      },
    }),
    BullModule.registerQueue(
      // {
      //   name: "cron_job",
      //   connection: {
      //     host: configRedis.host,
      //     port: configRedis.port
      //   },
      //   processors: [{
      //     concurrency: 100, // cấu hình processor chạy đồng thời
      //     path: join(__dirname, '/sandbox-processor/cron-job-processor.js'),
      //   }]
      // },
      {
        name: "order_pending_to_confirm",
        connection: {
          host: CONFIG_REDIS.host,
          port: CONFIG_REDIS.port
        },
        processors: [{
          concurrency: 1,
          path: join(__dirname, '/sandbox-processor/confirm-order.processor.js'),
        }]
      },
      {
        name: "create_order",
        connection: {
          host: CONFIG_REDIS.host,
          port: CONFIG_REDIS.port
        },
        processors: [{
          concurrency: 1,
          path: join(__dirname, '/sandbox-processor/create-order.processor.js'),
        }]
      },
    ),
    CoreSystemModule
  ],
  providers: [],
  exports: [
    BullModule
  ]
})
export class QueuesModule2 {}
