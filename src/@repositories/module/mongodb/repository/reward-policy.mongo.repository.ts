import { InjectModel } from "@nestjs/mongoose";
import { BaseMongoRepositoryAbstract } from "./base.mongo.repository.abstract";
import { RewardPolicy } from "../@database";
import { Model } from "mongoose";
import { RewardPolicyRepositoryInterface } from "../interface";

export class RewardPolicyMongoRepository extends BaseMongoRepositoryAbstract<RewardPolicy> implements RewardPolicyRepositoryInterface {
    constructor(
        @InjectModel(RewardPolicy.name)
        private readonly repository: Model<RewardPolicy>,
    ) {
        super(repository);
    }
}