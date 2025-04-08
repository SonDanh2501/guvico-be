import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { PhoneOTP } from "../@database"
import { PhoneOTPRepositoryInterface } from "../interface/phone-otp.interface"
import { BaseMongoRepositoryAbstract } from "./base.mongo.repository.abstract"


export class PhoneOTPMongoRepository extends BaseMongoRepositoryAbstract<PhoneOTP> implements PhoneOTPRepositoryInterface
{
    constructor(
        @InjectModel(PhoneOTP.name)
        private readonly repository: Model<PhoneOTP>,
    ) {
        super(repository);
    }
}
