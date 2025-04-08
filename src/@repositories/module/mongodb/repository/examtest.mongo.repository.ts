import { InjectModel } from "@nestjs/mongoose";
import { BaseMongoRepositoryAbstract } from "./base.mongo.repository.abstract";
import { Model } from "mongoose";
import { ExamTest } from "../@database";
import { ExamTestRepositoryInterface } from "../interface";

export class ExamTestMongoRepository extends BaseMongoRepositoryAbstract<ExamTest> implements ExamTestRepositoryInterface {
    constructor(
        @InjectModel(ExamTest.name)
        private readonly repository: Model<ExamTest>,
    ) {
        super(repository);
    }
}
