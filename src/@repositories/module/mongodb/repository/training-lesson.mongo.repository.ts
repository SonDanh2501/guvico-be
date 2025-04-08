import { InjectModel } from "@nestjs/mongoose";
import { BaseMongoRepositoryAbstract } from "./base.mongo.repository.abstract";
import { Model } from "mongoose";
import { TrainingLessonRepositoryInterface } from "../interface";
import { TrainingLesson } from "../@database";

export class TrainingLessonMongoRepository extends BaseMongoRepositoryAbstract<TrainingLesson> implements TrainingLessonRepositoryInterface {
    constructor(
        @InjectModel(TrainingLesson.name)
        private readonly repository: Model<TrainingLesson>,
    ) {
        super(repository);
    }
}
