import { NestFactory } from '@nestjs/core';
import { SandboxedJob } from 'bullmq';
import { Service } from 'src/@core';
import { UserService } from 'src/chat-service/user/user.service';
import { CoreSystemModule } from 'src/core-system/core-system.module';
import { GroupOrderSystemService } from 'src/core-system/group-order-system/group-order-system.service';
import { CronjobModule } from 'src/cronjob/cronjob.module';
import { OrderSchedulerService } from 'src/cronjob/order-scheduler/order-scheduler.service';
import { PromotionSchedulerService } from 'src/cronjob/promotion-scheduler/promotion-scheduler.service';
import { PushNotificationService } from 'src/cronjob/push-notification/push-notification.service';


export default async function (job: SandboxedJob) {
    try {
        // const coreModule = await NestFactory.createApplicationContext(CronjobModule);


        console.log("start CronJob");
        


        // const pushNotificationService = coreModule.get(PushNotificationService);
        // const orderSchedulerService = coreModule.get(OrderSchedulerService);
        // const promotionSchedulerService = coreModule.get(PromotionSchedulerService);


        // pushNotificationService.processPushNotification();
        // promotionSchedulerService.turnOnLoopPromotion();
        // orderSchedulerService.systemReviewOrder();
        // orderSchedulerService.autoCheckReview();



        // switch(job.name) {
        //     case "processPushNotification": {
        //         pushNotificationService.processPushNotification();
        //     } 
        //     case "turnOnLoopPromotion": {
        //         promotionSchedulerService.turnOnLoopPromotion();
        //     }
        //     case "systemReviewOrder": {
        //         orderSchedulerService.systemReviewOrder();
        //     } 
        //     case "autoCheckReview": {
        //         orderSchedulerService.autoCheckReview();
        //     }
        //     default: {
        //         break;
        //     }
        // }

        // coreModule.close();
        return true;
    } catch (err) {
        console.log(err, 'err');
    }

}