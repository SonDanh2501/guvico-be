// // src/worker.ts
// import { NestFactory } from '@nestjs/core';
// import { Worker } from 'bullmq';
// import { AppModule } from 'src/app.module';
// import { CoreSystemModule2 } from 'src/core-system/@core-system/core-system.module';
// import { OrderSystemService2 } from 'src/core-system/@core-system/order-system/order-system.service';
// import { QueuesSystemService } from 'src/core-system/@core-system/queues-system/queues-system.service';

// async function bootstrap3() {
//     const app = await NestFactory.createApplicationContext(CoreSystemModule2);
//     const queuesSystemService = app.get(QueuesSystemService);

//   new Worker('orderQueue', async (job) => {
//     console.log(job, 'job');
    
//     await queuesSystemService.createOrderInQueues(job.data)
//     // await CoreSystemModule2.(job.data); // Sử dụng hàm xử lý từ core-system
//   }, {
//     connection: {
//       host: 'localhost',
//       port: 6379,
//     },
//   });
// }

// bootstrap3();



import { NestFactory } from '@nestjs/core';
import { QueuesModule } from '../queues.module';

async function bootstrap() {
  // Tạo ứng dụng theo dạng context (không cần HTTP server)
  await NestFactory.createApplicationContext(QueuesModule);
  console.log('Worker is running...');
}

bootstrap();
