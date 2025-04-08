import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CollaboratorSetting, CollaboratorSettingDocument } from 'src/@core/db/schema/collaborator_setting.schema';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';

@Injectable()
export class SettingService {
    constructor(
        private customExceptionService: CustomExceptionService,
        @InjectModel(CollaboratorSetting.name) private collaboratorSettingSchema: Model<CollaboratorSettingDocument>,
    ) { }

    async getSetting() {
        try {
            const getItem = await this.collaboratorSettingSchema.findOne();
            return getItem;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);

        }
    }
}
