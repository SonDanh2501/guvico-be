import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { Accumulation } from "../@database"
import { AccumulationRepositoryInterface } from "../interface"
import { BaseMongoRepositoryAbstract } from "./base.mongo.repository.abstract"

export class AccumulationMongoRepository extends BaseMongoRepositoryAbstract<Accumulation> implements AccumulationRepositoryInterface
{
    constructor(
        @InjectModel(Accumulation.name)
        private readonly repository: Model<Accumulation>,
    ) {
        super(repository);
    }
}