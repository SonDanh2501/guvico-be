import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HistoryPoint, HistoryPointDocument } from 'src/@core/db/schema/history_point.schema';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';
// import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
// import { Logger } from 'winston';

@Injectable()
export class HistoryPointService {
    constructor(
        private customExceptionService: CustomExceptionService,
        // @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        @InjectModel(HistoryPoint.name) private historyPointModel: Model<HistoryPointDocument>,
    ) { }

    
    async newActivityPoint(payload) {
        try {
            const newItem = new this.historyPointModel({
                creator_object: payload.creator_object,
                id_creator: payload.id_creator,
                owner_object: payload.owner_object,
                owner_id: payload.owner_id,
                value: payload.value,
                related_id: payload.related_id,
                related: payload.related,
                date_create: new Date(Date.now()).toISOString(),
            })
            await newItem.save();
            return true;
        } catch (err) {
            // this.logger.error(err.response || err.toString());
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }
}
