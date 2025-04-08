import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Collaborator, CollaboratorDocument, iPageDTO } from 'src/@core';
import { RewardCollaborator, RewardCollaboratorDocument } from 'src/@core/db/schema/reward_collaborator.schema';

@Injectable()
export class RewardService {
    constructor(
        @InjectModel(Collaborator.name) private collaboratorModel: Model<CollaboratorDocument>,
        @InjectModel(RewardCollaborator.name) private rewardCollaboratorModel: Model<RewardCollaboratorDocument>,

    ) { }

    async getListReward(lang, iPage: iPageDTO, user) {
        try {
            const query = {
                $and: [
                    { is_delete: false },
                    { is_active: true }
                ]
            }
            const getList = await this.rewardCollaboratorModel.find(query)
                .sort({ date_create: - 1, _id: 1 })
                .skip(iPage.start)
                .limit(iPage.length);
            const count = await this.rewardCollaboratorModel.count(query);
            const result = {
                start: Number(iPage.start),
                length: Number(iPage.length),
                total_item: count,
                data: getList
            }
            return result
        } catch (err) {
            throw new HttpException(err.response || [{ message: err.toString(), field: null }], err.status || HttpStatus.FORBIDDEN);
        }
    }
}
