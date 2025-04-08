// import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
// import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
// import { Job } from 'bullmq';
// import { GroupOrderSystemService } from 'src/core-system/group-order-system/group-order-system.service';

// @Processor({ name: "create_order" })
// @Injectable()
// export class CreateOrderQueueService extends WorkerHost {
//   constructor(
//     // private groupOrderSystemService: GroupOrderSystemService,
//   ) {
//     super();
//   }
  
//   // Khi job bắt đầu được xử lý
//   @OnWorkerEvent('active')
//   onQueueActive(job: Job) {
//     console.log(`Job has been started: ${job.id}`);
//   }

//   // Phương thức xử lý job chính
//   async process(job: Job<any, any, string>, token?: string) {
//     try {
//       // await this.groupOrderSystemService.createItem(
//       //   job.data.lang,
//       //   job.data.req,
//       //   job.data.admin,
//       //   job.data.headers,
//       // );
//       return true;
//     } catch (err) {
//       throw new HttpException(
//         err.response || [{ message: err.toString(), field: null }],
//         err.status || HttpStatus.FORBIDDEN,
//       );
//     }
//   }

//   // Khi job hoàn thành
//   @OnWorkerEvent('completed')
//   onQueueComplete(job: Job, result: any) {
//     console.log(`Job has been finished: ${job.id}`);
//   }
// }



// import { NestFactory } from '@nestjs/core';
// import { SandboxedJob } from 'bullmq';
// import { Service } from 'src/@core';
// import { UserService } from 'src/chat-service/user/user.service';
// import { CoreSystemModule } from 'src/core-system/core-system.module';
// import { GroupOrderSystemService } from 'src/core-system/group-order-system/group-order-system.service';
// // import { coreSystemApp } from '../bootstrapSharedContext'; // Import context chung
// import { CoreSystemModule2 } from 'src/core-system/@core-system/core-system.module';


// async function bootstrapCoreSystemContext() {
//   const app = await NestFactory.createApplicationContext(CoreSystemModule2);
//   return app
// }
// export const coreSystemApp = bootstrapCoreSystemContext();

// export default async function (job: SandboxedJob) {
//     try {

//         // const coreSystemModule = await NestFactory.createApplicationContext(CoreSystemModule);
//         // const groupOrderSystemService = coreSystemModule.get(GroupOrderSystemService);

//         const groupOrderSystemService = (await coreSystemApp).get(GroupOrderSystemService)
//         // const groupOrderSystemService2 = (await coreSystemApp).get(GroupOrderSystemService)

//         console.log(job, "start create order");
//         // job.data.req["timestamp"] = job.timestamp;
//         switch(job.name) {
//             case "customer": {
//                 // await groupOrderSystemService.createItemQueue(job.data.lang, job.data.infoJob, job.data.req, job.data.admin, job.data.headers);
//             }
//             default: {
//                 break;
//             }
//         }


//         return true;
//     } catch (err) {
//         console.log(err, 'err');
//     }
// }




import { SandboxedJob } from 'bullmq';
import * as net from 'net';

// Hàm yêu cầu context server gọi một service
function callServiceInContext(service: string, method: string, args: any[]): Promise<any> {
  console.log('check 1');
  
  return new Promise((resolve, reject) => {
    const client = net.createConnection({ port: 9000 }, () => {
      console.log('[Processor] Connected to context server...');
      const message = JSON.stringify({
        command: 'callService',
        payload: { service, method, args },
      });
      client.write(message);
    });

    client.on('data', (data) => {
      const response = JSON.parse(data.toString());
      if (response.success) {
        resolve(response.result);
      } else {
        reject(new Error(response.error || 'Unknown error'));
      }
      client.end(); // Đóng kết nối sau khi nhận dữ liệu
    });

    client.on('error', (err) => {
      console.error('[Processor] Connection error:', err);
      reject(err);
    });

    client.on('end', () => {
      console.log('[Processor] Disconnected from context server.');
    });
  });
}

export default async function processJob(job: SandboxedJob): Promise<boolean> {
  try {
    console.log(`[Processor] Start processing job: ${job.name}`);

    switch (job.name) {
      case 'customer': {
        console.log('[Processor] Handling customer job...');

        // Ví dụ gọi GroupOrderSystemService.createItemQueue
        const result = await callServiceInContext(
          'GroupOrderSystemService',  // Tên của service
          'createItemQueue',          // Tên phương thức
          [job.data.lang, job.data.infoJob, job.data.req, job.data.admin, job.data.headers] // Tham số
        );
        console.log('[Processor] Service response:', result);
        break;
      }
      default: {
        console.log(`[Processor] No handler for job: ${job.name}`);

        await callServiceInContext("GroupOrderSystemService2", "testQueue", [job.data.lang, job.data.infoJob, job.data.req, job.data.admin, job.data.headers]);

        break;
      }
    }

    return true;
  } catch (error) {
    console.error('[Processor] Error while processing job:', error);
    throw error;
  }
}
