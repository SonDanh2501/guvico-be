import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { GroupOrderSystemService } from 'src/core-system/group-order-system/group-order-system.service';

@Processor({name: "create_order"})
@Injectable()
export class CreateOrderQueueService extends WorkerHost {
    constructor (
        private groupOrderSystemService: GroupOrderSystemService,
    ) {
        super()
    }

    @OnWorkerEvent('active')
	onQueueActive(job: Job) {
        console.log(`Job has been started: ${job.id}`);
	}

    async process(job: Job<any, any, string>, token?: string) {
        try {
            await this.groupOrderSystemService.createItem(job.data.lang, job.data.req, job.data.admin, job.data.headers);
            return true;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN)
        }
      }

      @OnWorkerEvent('completed')
      onQueueComplete(job: Job, result: any) {
          console.log(`Job has been finished: ${job.id}`);
      }
}



// import { Processor, WorkerHost } from '@nestjs/bullmq';
// import { Logger } from '@nestjs/common';
// import { Job } from 'bullmq';

// @Processor("order", {concurrency: 1})
// export class OrderQueueService extends WorkerHost {
// 	private logger = new Logger();
// 	async process(job: Job<any, any, string>, token?: string): Promise<any> {


        



// 		switch (job.name) {
// 			case 'optimize-size':
// 				const optimzied_image = await this.optimizeImage(job.data);
// 				console.log({ optimzied_image });
// 				return optimzied_image;

// 			default:
// 				throw new Error('No job name match');
// 		}
// 	}

// 	async optimizeImage(image: unknown) {
// 		this.logger.log('Processing image....');
// 		return await new Promise((resolve) =>
// 			setTimeout(() => resolve(image), 30000),
// 		);
// 	}
// }