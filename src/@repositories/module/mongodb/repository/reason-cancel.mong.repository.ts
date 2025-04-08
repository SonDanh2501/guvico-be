import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { BaseMongoRepositoryAbstract } from "./base.mongo.repository.abstract";
import { ReasonCancel } from "src/@core/db/schema/reason_cancel.schema";
import { ReasonCancelRepositoryInterface } from "../interface/reason-cancel.interface";


export class ReasonCancelMongoRepository extends BaseMongoRepositoryAbstract<ReasonCancel> implements ReasonCancelRepositoryInterface{
    constructor(
        @InjectModel(ReasonCancel.name)
        private readonly repository: Model<ReasonCancel>,
    ){
       super(repository)

    }
}