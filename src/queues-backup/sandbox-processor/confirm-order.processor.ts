import { SandboxedJob } from 'bullmq'
import { OrderSystemService } from 'src/core-system/order-system/order-system.service'
import { collaboratorApp } from '../bootstrapSharedContext'; // Import context chung

export default async function (job: SandboxedJob) {
    try {

        // const coreSystemModule = await NestFactory.createApplicationContext(CoreSystemModule);
        // const groupOrderSystemService = coreSystemModule.get(GroupOrderSystemService);

        const orderSystemService = (await collaboratorApp).get(OrderSystemService)
        // const groupOrderSystemService2 = (await coreSystemApp).get(GroupOrderSystemService)

        // console.log(job.timestamp, "start create order");
        job.data.req["timestamp"] = job.timestamp;


        await orderSystemService.orderPendingToConfirm(job.data.lang, job.data.id_order, job.data.collaborator, null, null, job.data.headers, true);

        // const result = await this.orderSystemService.orderPendingToConfirm(lang, id, collaborator, null, version, true);



        // switch(job.name) {
        //     case "customer": {
        //         console.log(job, 'job');
                


        //         await groupOrderSystemService.createItemQueue(job.data.lang, job.data.infoJob, job.data.req, job.data.admin, job.data.headers);
        //     }
        //     default: {
        //         break;
        //     }
        // }



        return true;
    } catch (err) {
        console.log(err, 'err');
    }



}