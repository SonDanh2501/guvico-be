import { InjectModel } from "@nestjs/mongoose";
import { BaseMongoRepositoryAbstract } from "./base.mongo.repository.abstract";
import { Model } from "mongoose";
import { Service } from "../@database";
import { ServiceRepositoryInterface } from "../interface";

export class ServiceMongoRepository extends BaseMongoRepositoryAbstract<Service> implements ServiceRepositoryInterface
{
    constructor(
        @InjectModel(Service.name)
        private readonly repository: Model<Service>,
    ) {
        super(repository);
    }
}
