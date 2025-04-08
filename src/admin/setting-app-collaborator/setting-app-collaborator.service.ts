import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CollaboratorSetting, CollaboratorSettingDocument } from 'src/@core/db/schema/collaborator_setting.schema';
import { CustomExceptionService } from 'src/@share-module/custom-exception/custom-exception.service';

@Injectable()
export class SettingAppCollaboratorService {
    constructor(
        private customExceptionService: CustomExceptionService,

        @InjectModel(CollaboratorSetting.name) private collaboratorSettingModel: Model<CollaboratorSettingDocument>,
    ) { }

    async getSetting() {
        try {
            const getData = await this.collaboratorSettingModel.findOne();
            return getData;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }

    async editSetting(payload) {
        try {
            const getData = await this.collaboratorSettingModel.findOne();
            getData.max_distance_order = payload.max_distance_order || getData.max_distance_order;
            getData.support_version_app = payload.support_version_app || getData.support_version_app;
            getData.background_header = payload.background_header || getData.background_header;
            getData.time_cancel = payload.time_cancel || getData.time_cancel;
            getData.time_collaborator_job = payload.time_collaborator_job || getData.time_collaborator_job;
            await getData.save();
            return getData;
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
