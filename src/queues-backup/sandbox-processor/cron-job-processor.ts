import { NestFactory } from '@nestjs/core';
import { SandboxedJob } from 'bullmq';
// import { CronjobModule } from 'src/cronjob/cronjob.module';
// import { GroupOrderSystemService } from 'src/core-system/group-order-system/group-order-system.service';
// import { cronJobApp } from '../bootstrapSharedContext'; // Import context chung

export default async function (job: SandboxedJob) {
    try {
        // NestFactory.createApplicationContext(CronjobModule);
        // cronJobApp.then().catch(err => console.log(err));
        console.log("start CronJob");
        // (await cronJobApp).close()
        return true;
    } catch (err) {
        console.log(err, 'err');
    }
}