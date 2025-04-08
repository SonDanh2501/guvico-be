import { InjectModel } from "@nestjs/mongoose";
import { CustomerSetting, GroupService } from "../@database";
import { Model } from "mongoose";
import { BaseMongoRepositoryAbstract } from "./base.mongo.repository.abstract";
import { CustomerSettingRepositoryInterface, GroupServiceRepositoryInterface } from "../interface";

export class GroupServiceMongoRepository extends BaseMongoRepositoryAbstract<GroupService> implements GroupServiceRepositoryInterface
{
    constructor(
        @InjectModel(GroupService.name)
        private readonly repository: Model<GroupService>,
    ) {
        super(repository);
    }
}