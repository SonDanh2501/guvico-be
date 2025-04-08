import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Popup, PopupDocument } from 'src/@core/db/schema/popup.schema';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';

@Injectable()
export class PopupService {
    constructor(
        private customExceptionService: CustomExceptionService,
        @InjectModel(Popup.name) private popupModel: Model<PopupDocument>,
    ) { }

    async getPopup(lang) {
        try {
            const arrItem = await this.popupModel.find({
                $and: [
                    { is_active: true },
                    { is_delete: false }
                ]
            })
            return {
                data: arrItem
            };
        } catch (err) {
            throw new HttpException(err.response || err.toString(), HttpStatus.FORBIDDEN);
        }
    }
}
