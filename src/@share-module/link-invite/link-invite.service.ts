import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LinkInvite, LinkInviteDocument } from 'src/@core/db/schema/link_invite.schema';
import { CustomExceptionService } from '../custom-exception/custom-exception.service';

@Injectable()
export class LinkInviteService {
    constructor(
        private customExceptionService: CustomExceptionService,
        @InjectModel(LinkInvite.name) private linkInviteModel: Model<LinkInviteDocument>,
    ) { }

    async setDeviceReferred(code, payload, ipAddr) {
        try {
            const newItem = new this.linkInviteModel({
                ip: ipAddr,
                token: payload.token,
                date_create: new Date().toISOString(),
                code_invite: code,
                is_active : true,
                is_delete : false
            });
            await newItem.save()
            return true;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }

    async getDeviceReferred(payload, ipAddr) {
        try {
            const findItem = await this.linkInviteModel.findOne({ip: ipAddr, is_active: true, is_delete: false}).sort({date_create: -1})
            return findItem;
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }
}
