import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron } from '@nestjs/schedule';
import { addMinutes } from 'date-fns';
import { Model } from 'mongoose';
import { LinkInvite, LinkInviteDocument } from '../../@core/db/schema/link_invite.schema';

@Injectable()
export class LinkInviteService {
    constructor(
        @InjectModel(LinkInvite.name) private linkInviteModel: Model<LinkInviteDocument>,
    ) { }

    @Cron('0 */5 * * * *')
    async handleCron() {
        this.processLinkInvite();

    }

    async processLinkInvite() {
        try {
            const query = {
                $and: [
                    { is_active: true },
                    { is_delete: false }
                ]
            }
            // const count = await this.linkInviteModel.count(query);
            const getLink = await this.linkInviteModel.find(query);
            for (let item of getLink) {
                const getCurrenTime = new Date(Date.now()).toISOString();
                const future10Time = addMinutes(new Date(item.date_create), 30).toISOString();
                const check = new Date(getCurrenTime).getTime() - new Date(future10Time).getTime();
                if (check > 0) {
                    item.is_active = false;
                    console.log('update is_active');
                    await item.save();
                }
            }
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
