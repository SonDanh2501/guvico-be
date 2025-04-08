import { NestFactory } from '@nestjs/core';
import { SandboxedJob } from 'bullmq';
import { CronjobModule } from 'src/cronjob/cronjob.module';


export default async function (job: SandboxedJob) {
    try {
        // NestFactory.createApplicationContext(CronjobModule);

        for(let i = 0 ; i < 100 ; i++) {
            setTimeout(() => {
                console.log( i, " - job id - ", job.id);
            }, 1000);
        }
        // console.log("start CronJob");
        return true;
    } catch (err) {
        console.log(err, 'err');
    }
}