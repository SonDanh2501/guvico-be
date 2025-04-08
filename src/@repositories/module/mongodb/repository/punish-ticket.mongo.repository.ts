import { InjectModel } from "@nestjs/mongoose";
import { BaseMongoRepositoryAbstract } from "./base.mongo.repository.abstract";
import { PunishTicket } from "../@database";
import { Model } from "mongoose";
import { PunishTicketRepositoryInterface } from "../interface";

export class PunishTicketMongoRepository extends BaseMongoRepositoryAbstract<PunishTicket> implements PunishTicketRepositoryInterface {
    constructor(
        @InjectModel(PunishTicket.name)
        private readonly repository: Model<PunishTicket>,
    ) {
        super(repository);
    }
}