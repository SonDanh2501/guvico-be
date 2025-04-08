import { InjectModel } from "@nestjs/mongoose";
import { BaseMongoRepositoryAbstract } from "./base.mongo.repository.abstract";
import { PunishPolicy } from "../@database";
import { Model } from "mongoose";
import { PunishPolicyRepositoryInterface } from "../interface";

export class PunishPolicyMongoRepository extends BaseMongoRepositoryAbstract<PunishPolicy> implements PunishPolicyRepositoryInterface {
    constructor(
        @InjectModel(PunishPolicy.name)
        private readonly repository: Model<PunishPolicy>,
    ) {
        super(repository);
    }
}