import { InjectModel } from "@nestjs/mongoose";
import { CustomerSetting } from "../@database";
import { Model } from "mongoose";
import { BaseMongoRepositoryAbstract } from "./base.mongo.repository.abstract";
import { CustomerSettingRepositoryInterface } from "../interface";

export class CustomerSettingMongoRepository extends BaseMongoRepositoryAbstract<CustomerSetting> implements CustomerSettingRepositoryInterface
{
    constructor(
        @InjectModel(CustomerSetting.name)
        private readonly repository: Model<CustomerSetting>,
    ) {
        super(repository);
    }
}