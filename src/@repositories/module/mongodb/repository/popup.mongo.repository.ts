import { Model } from "mongoose";
import { Popup } from "../@database";
import { BaseMongoRepositoryAbstract } from "./base.mongo.repository.abstract";
import { InjectModel } from "@nestjs/mongoose";
import { PopupRepositoryInterface } from "../interface";


export class PopupMongoRepository extends BaseMongoRepositoryAbstract<Popup> implements PopupRepositoryInterface
{
    constructor(
        @InjectModel(Popup.name)
        private readonly repository: Model<Popup>,
    ) {
        super(repository);
    }
}
