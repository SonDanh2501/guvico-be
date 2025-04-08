import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Report } from '../@database'
import { ReportRepositoryInterface } from '../interface'
import { BaseMongoRepositoryAbstract } from './base.mongo.repository.abstract'


export class ReportMongoRepository extends BaseMongoRepositoryAbstract<Report> implements ReportRepositoryInterface
{
    constructor(
        @InjectModel(Report.name)
        private readonly repository: Model<Report>,
    ) {
        super(repository);
    }
}