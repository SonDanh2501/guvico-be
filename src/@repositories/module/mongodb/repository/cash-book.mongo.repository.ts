import { InjectModel } from "@nestjs/mongoose";
import { BaseMongoRepositoryAbstract } from "./base.mongo.repository.abstract";
import { Transaction } from "../@database/schema/transaction.schema";
import { Model } from "mongoose";
import { TransactionRepositoryInterface } from "../interface";

export class CashBookMongoRepository extends BaseMongoRepositoryAbstract<Transaction> implements TransactionRepositoryInterface
{
    constructor(
        @InjectModel(Transaction.name)
        private readonly repository: Model<Transaction>,
    ) {
        super(repository);
    }
}
