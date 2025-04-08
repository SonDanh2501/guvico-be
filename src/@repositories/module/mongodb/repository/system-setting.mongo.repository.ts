import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { SystemSetting } from "../@database"
import { SystemSettingRepositoryInterface } from "../interface"
import { BaseMongoRepositoryAbstract } from "./base.mongo.repository.abstract"

export class SystemSettingMongoRepository extends BaseMongoRepositoryAbstract<SystemSetting> implements SystemSettingRepositoryInterface
{
    constructor(
        @InjectModel(SystemSetting.name)
        private readonly repository: Model<SystemSetting>,
    ) {
        super(repository);
    }
}
