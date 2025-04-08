import { InjectModel } from "@nestjs/mongoose";
import { CollaboratorSetting } from "../@database";
import { Model } from "mongoose";
import { BaseMongoRepositoryAbstract } from "./base.mongo.repository.abstract";
import { CollaboratorSettingRepositoryInterface } from "../interface";

export class CollaboratorSettingMongoRepository extends BaseMongoRepositoryAbstract<CollaboratorSetting> implements CollaboratorSettingRepositoryInterface
{
    constructor(
        @InjectModel(CollaboratorSetting.name)
        private readonly repository: Model<CollaboratorSetting>,
    ) {
        super(repository);
    }
}