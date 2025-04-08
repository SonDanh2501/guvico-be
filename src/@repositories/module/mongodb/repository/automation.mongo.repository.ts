import { InjectModel } from "@nestjs/mongoose";
import { BaseMongoRepositoryAbstract } from "./base.mongo.repository.abstract";
import { Transaction } from "../@database/schema/transaction.schema";
import { Model } from "mongoose";
import { Automation } from "../@database/schema/automation.schema";
import { AutomationRepositoryInterface } from "../interface/automation.interface";

export class AutomationMongoRepository extends BaseMongoRepositoryAbstract<Automation> implements AutomationRepositoryInterface
{
    constructor(
        @InjectModel(Automation.name)
        private readonly repository: Model<Automation>,
    ) {
        super(repository);
    }
}
