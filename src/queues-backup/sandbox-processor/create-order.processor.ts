import { NestFactory } from '@nestjs/core';
import { SandboxedJob } from 'bullmq';
import { Service } from 'src/@core';
import { UserService } from 'src/chat-service/user/user.service';
import { CoreSystemModule } from 'src/core-system/core-system.module';
import { GroupOrderSystemService } from 'src/core-system/group-order-system/group-order-system.service';
import { coreSystemApp } from '../bootstrapSharedContext'; // Import context chung

export default async function (job: SandboxedJob) {
    try {

        // const coreSystemModule = await NestFactory.createApplicationContext(CoreSystemModule);
        // const groupOrderSystemService = coreSystemModule.get(GroupOrderSystemService);

        const groupOrderSystemService = (await coreSystemApp).get(GroupOrderSystemService)
        // const groupOrderSystemService2 = (await coreSystemApp).get(GroupOrderSystemService)

        // console.log(job.timestamp, "start create order");
        job.data.req["timestamp"] = job.timestamp;
        switch(job.name) {
            case "customer": {


                await groupOrderSystemService.createItemQueue(job.data.lang, job.data.infoJob, job.data.req, job.data.admin, job.data.headers);
            }
            default: {
                break;
            }
        }



        return true;
    } catch (err) {
        console.log(err, 'err');
    }



}