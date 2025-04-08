import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Cron, CronExpression } from '@nestjs/schedule'
import { Model } from 'mongoose'
import { Collaborator, CollaboratorDocument } from 'src/@core'
import { CollaboratorSystemService } from 'src/core-system/@core-system/collaborator-system/collaborator-system.service'
import { ActivitySystemService } from 'src/core-system/activity-system/activity-system.service'

@Injectable()
export class CollaboratorSchedulerService {
    constructor(
        private activitySystemService: ActivitySystemService,
        private collaboratorSystemService: CollaboratorSystemService,

        @InjectModel(Collaborator.name) private collaboratorModel: Model<CollaboratorDocument>,
    ) { }


    @Cron('50 */5 * * * *')
    handleCron() {
        this.checkOutDateUnlock();
    }    

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async runEveryAtMidNight() {
        this.collaboratorSystemService.payRewardToReferralPerson();
    }

    async checkOutDateUnlock() {
        try {
            const query: any = {
                $and: [
                    {is_delete: false},
                    {is_verify: true},
                    {is_locked: true},
                    {date_lock: {$ne: null}}
                ]
            }
            const findCollaboratorLockedByDay = await this.collaboratorModel.find(query).select({_id: 1, date_lock: 1, is_locked: 1, status: 1});
            const dateNow = new Date().getTime();
            for(const item of findCollaboratorLockedByDay) {
                const dateLock = new Date(item.date_lock).getTime();
                if(dateNow > dateLock) {
                    item.is_locked = false;
                    item.date_lock = null;
                    item.status = "actived"
                    await item.save();
                    this.activitySystemService.systemUnlockCollaborator(item);
                }
            }
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }
}
