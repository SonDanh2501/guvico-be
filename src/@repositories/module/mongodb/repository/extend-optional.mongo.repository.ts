import { Model } from "mongoose";
import { ExtendOptional } from "../@database";
import { ExtendOptionalRepositoryInterface } from "../interface";
import { BaseMongoRepositoryAbstract } from "./base.mongo.repository.abstract";
import { InjectModel } from "@nestjs/mongoose";


export class ExtendOptionalMongoRepository extends BaseMongoRepositoryAbstract<ExtendOptional> implements ExtendOptionalRepositoryInterface
{
    constructor(
        @InjectModel(ExtendOptional.name)
        private readonly repository: Model<ExtendOptional>,
    ) {
        super(repository);
    }
}
