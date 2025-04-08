import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { PhoneBlacklist } from "../@database"
import { PhoneBlacklistRepositoryInterface } from "../interface/phone-blacklist.interface"
import { BaseMongoRepositoryAbstract } from "./base.mongo.repository.abstract"


export class PhoneBlacklistMongoRepository extends BaseMongoRepositoryAbstract<PhoneBlacklist> implements PhoneBlacklistRepositoryInterface
{
    constructor(
        @InjectModel(PhoneBlacklist.name)
        private readonly repository: Model<PhoneBlacklist>,
    ) {
        super(repository);
    }
}
