import { InjectModel } from "@nestjs/mongoose";
import { BaseMongoRepositoryAbstract } from "./base.mongo.repository.abstract";
import { Model } from "mongoose";
import { BehaviorTrackingRepositoryInterface } from "../interface";
import { BehaviorTracking } from "../@database";

export class BehaviorTrackingMongoRepository extends BaseMongoRepositoryAbstract<BehaviorTracking> implements BehaviorTrackingRepositoryInterface
{
    constructor(
        @InjectModel(BehaviorTracking.name)
        private readonly repository: Model<BehaviorTracking>,
    ) {
        super(repository);
    }
}
