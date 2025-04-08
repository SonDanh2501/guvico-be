import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { GeneralHandleService } from './@share-module/general-handle/general-handle.service';
import { endOfDay, format, nextFriday, nextMonday, nextSaturday, nextSunday, nextThursday, nextTuesday, nextWednesday, startOfDay, subHours } from 'date-fns';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
@Injectable()
export class AppService implements OnApplicationBootstrap {
  constructor(
    private generalHandleService: GeneralHandleService,
    //@InjectQueue('cron_job') private readonly cronJobQueue: Queue,
  ) { }

  async onApplicationBootstrap(): Promise<any> {
    // this.cronJobQueue.add("run",{})
  }

  async getHello() {

    const a = this.generalHandleService.formatDateWithTimeZone(new Date('2023-08-01T12:00:40.994Z'), 'Asia/Ho_Chi_Minh');
    return a;
  }
}
