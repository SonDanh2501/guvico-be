import { InjectModel } from "@nestjs/mongoose";
import { BaseMongoRepositoryAbstract } from "./base.mongo.repository.abstract";
import { RewardTicket } from "../@database";
import { Model } from "mongoose";
import { RewardTicketRepositoryInterface } from "../interface";

export class RewardTicketMongoRepository extends BaseMongoRepositoryAbstract<RewardTicket> implements RewardTicketRepositoryInterface {
    constructor(
        @InjectModel(RewardTicket.name)
        private readonly repository: Model<RewardTicket>,
    ) {
        super(repository);
    }
}